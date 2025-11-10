import { StreamEvent, Metrics } from '@/types';

const MOONSHOT_API_KEY = import.meta.env.VITE_MOONSHOT_API_KEY;
const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

function countTokens(text: string): number {
  return text.split(/\s+/).filter((t) => t.length > 0).length;
}

export async function queryKimiK2(
  query: string,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  console.log('[API] Starting queryKimiK2 with query:', query);

  if (!MOONSHOT_API_KEY) {
    throw new Error('Moonshot API key not configured');
  }

  const messages = [
    {
      role: 'user',
      content: query,
    },
  ];

  const startTime = Date.now();
  let totalThinkingTokens = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let contentBuffer = '';
  let thinkingBuffer = '';

  try {
    console.log('[API] Making fetch request to:', MOONSHOT_API_URL);
    const response = await fetch(MOONSHOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-turbo-preview',
        messages: messages,
        stream: true,
        temperature: 1,
        top_p: 0.8,
        reasoning_content: true,
      }),
    });

    console.log('[API] Fetch response received. Status:', response.status, 'OK:', response.ok);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || response.statusText;
      } catch (e) {
        // Use statusText if response is not JSON
      }
      throw new Error(`API request failed: ${errorMessage}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    console.log('[API] Starting to read response stream...');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('[API] Stream reading completed. Total chunks:', chunkCount);
        break;
      }

      chunkCount++;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines[lines.length - 1];

      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (!line || !line.startsWith('data: ')) continue;

        const data = line.slice(6);
        if (data === '[DONE]') {
          console.log('[API] Received [DONE] signal');
          continue;
        }

        try {
          const json = JSON.parse(data);

          // Log the entire response structure for debugging (only first few chunks)
          if (chunkCount <= 10) {
            console.log('[API] Chunk', chunkCount, 'Full response:', JSON.stringify(json, null, 2));
          }

          const choice = json.choices?.[0];
          if (!choice) {
            console.warn('[API] No choice in response:', json);
            continue;
          }

          // Log the delta structure to understand what fields are available
          if (choice.delta) {
            if (chunkCount <= 10) {
              console.log('[API] Chunk', chunkCount, 'Delta structure:', JSON.stringify(choice.delta, null, 2));
              console.log('[API] Chunk', chunkCount, 'Delta keys:', Object.keys(choice.delta));
            }
          }

          // Handle thinking content - check multiple possible fields
          const thinkingContent = choice.delta?.thinking ||
                                 choice.delta?.reasoning ||
                                 choice.delta?.reasoning_content;

          if (thinkingContent) {
            console.log('[API] Thinking content found:', thinkingContent);
            thinkingBuffer += thinkingContent;
            const tokens = countTokens(thinkingContent);
            totalThinkingTokens += tokens;

            onEvent({
              type: 'thinking',
              data: {
                content: thinkingContent,
                tokens: tokens,
              },
            });
          }

          // Handle regular content
          if (choice.delta?.content) {
            contentBuffer += choice.delta.content;
            console.log('[API] Emitting content chunk. Total length so far:', contentBuffer.length);
            onEvent({
              type: 'content',
              data: {
                content: choice.delta.content,
              },
            });
          }

          // Handle usage/metrics from the final chunk
          if (choice.delta && choice.delta.usage) {
            console.log('[API] Usage data in delta:', choice.delta.usage);
            totalInputTokens = choice.delta.usage.prompt_tokens || totalInputTokens;
            totalOutputTokens = choice.delta.usage.completion_tokens || totalOutputTokens;
            totalThinkingTokens = choice.delta.usage.reasoning_tokens ||
                                 choice.delta.usage.thinking_tokens ||
                                 totalThinkingTokens;
          }

          // Also check for usage at the root level
          if (json.usage) {
            console.log('[API] Usage data at root:', json.usage);
            totalInputTokens = json.usage.prompt_tokens || totalInputTokens;
            totalOutputTokens = json.usage.completion_tokens || totalOutputTokens;
            totalThinkingTokens = json.usage.reasoning_tokens ||
                                 json.usage.thinking_tokens ||
                                 totalThinkingTokens;
          }
        } catch (e) {
          console.error('[API] Error parsing stream data:', e, 'Line:', data);
        }
      }
    }

    const elapsedTime = Date.now() - startTime;

    console.log('[API] Stream complete. Content buffer length:', contentBuffer.length);
    console.log('[API] Total thinking tokens:', totalThinkingTokens);
    console.log('[API] Total input tokens:', totalInputTokens);
    console.log('[API] Total output tokens:', totalOutputTokens);
    console.log('[API] Elapsed time:', elapsedTime, 'ms');

    // Emit final metrics
    const finalMetrics = {
      thinkingTokens: totalThinkingTokens,
      toolCalls: 0,
      elapsedTime,
      inputTokens: totalInputTokens || countTokens(query),
      outputTokens: totalOutputTokens || countTokens(contentBuffer),
    } as Metrics;

    console.log('[API] Emitting final metrics:', finalMetrics);
    onEvent({
      type: 'metrics',
      data: finalMetrics,
    });

    console.log('[API] Emitting done event');
    onEvent({ type: 'done', data: {} });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('[API] Error occurred:', error, err);
    onEvent({
      type: 'error',
      data: {
        message: error,
      },
    });
  }
}
