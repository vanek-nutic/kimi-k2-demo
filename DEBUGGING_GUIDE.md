# Debugging Guide - Panel Data Display Issues

## Problem Statement
The Thinking, Tool Calls, and Results panels were showing "Waiting for..." messages even though:
- The API was returning data (verified with curl)
- The Metrics panel WAS updating correctly
- No error messages were displayed

## Root Cause Analysis

### What We Know Works
1. **API Communication**: The fetch request succeeds and returns streaming data
2. **Event System**: The 'metrics' event is being emitted and received correctly
3. **State Management**: At least `setMetrics` is working (proven by metrics panel updating)
4. **Error Handling**: No errors are being caught or displayed

### Potential Issues Identified

#### 1. API Response Format
The Moonshot Kimi K2 API has specific behaviors:
- **Thinking/Reasoning Content**: Only returned for complex reasoning tasks
- **Simple Queries**: May not trigger extended reasoning mode
- **Field Names**: The API uses specific field names that must match our code

**Fix Applied**: Enhanced logging to show exactly what fields the API returns

#### 2. Event Data Structure
The `StreamEvent` interface has optional data:
```typescript
export interface StreamEvent {
  type: 'thinking' | 'tool_call' | 'content' | 'metrics' | 'done' | 'error';
  data?: any;  // Optional!
}
```

If `event.data` is undefined, accessing `event.data.content` will cause issues.

**Fix Applied**: Added comprehensive logging to trace data flow

#### 3. State Update Timing
React state updates are asynchronous. The components must re-render when state changes.

**Fix Applied**: Added event counters to verify state updates are triggering

## Diagnostic Features Added

### 1. Enhanced Console Logging

**In api.ts**:
- First 10 chunks show full JSON response structure
- Delta structure is logged for every chunk
- Content and thinking events are logged when emitted

**In App.tsx**:
- Every event received is logged with full data
- State updates are logged with before/after values
- Event counters track how many of each event type received

**In Components**:
- ThinkingPanel logs when it renders and what data it receives
- ResultsPanel logs content length and preview
- All useEffect hooks log when they fire

### 2. Event Counter Display

A blue diagnostic panel appears below the query input showing:
- Number of 'thinking' events received
- Number of 'content' events received
- Number of 'tool_call' events received
- Number of 'metrics' events received

This helps identify which events are actually being emitted/received.

### 3. Improved Empty State Messages

**ThinkingPanel**: Now explains that thinking steps only appear for complex reasoning tasks

**ResultsPanel**: Already had good messaging

**ToolCallsPanel**: Already had appropriate "Waiting for tool calls..." message

## How to Debug

### Step 1: Open Browser Console
1. Navigate to http://localhost:4175
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Clear any existing logs

### Step 2: Submit a Test Query
Use one of these test queries:

**Simple Query** (to test basic content flow):
```
What is 2+2?
```

**Complex Query** (to test reasoning/thinking):
```
Explain quantum computing in simple terms
```

**Research Query** (to potentially test tool calls):
```
Research the top 3 programming languages in 2024 and compare them
```

### Step 3: Analyze Console Output

Look for these key log messages in order:

#### Expected Log Sequence
```
[API] Starting queryKimiK2 with query: ...
[API] Making fetch request to: ...
[API] Fetch response received. Status: 200 OK: true
[API] Starting to read response stream...

[API] Chunk 1 Full response: {...}
[API] Chunk 1 Delta structure: {...}
[API] Chunk 1 Delta keys: [...]

[App.tsx] Event received: content {...}
[App.tsx] CONTENT event - data: {...}
[App.tsx] CONTENT event - content: "..."
[App.tsx] Result content updated. Length: X
[ResultsPanel] Content changed, length: X

[API] Stream complete. Content buffer length: X
[API] Emitting final metrics: {...}
[App.tsx] Event received: metrics {...}
[App.tsx] METRICS event received: {...}
```

#### What to Check

**If NO logs appear at all**:
- API key is missing or invalid
- CORS or network issue
- Check Network tab in DevTools for failed requests

**If API logs appear but NO App.tsx logs**:
- Event callback not being called
- Event emitter not connected properly

**If App.tsx logs show events but counters don't update**:
- State update is failing
- Component not re-rendering

**If counters update but panels stay empty**:
- Data structure mismatch
- Check what `event.data` actually contains
- Verify `event.data.content` exists for content events

**If "content: 0" in event counters**:
- API is not returning content in delta
- Check the raw API response structure in logs
- May need to adjust field names being checked

### Step 4: Check Event Counter Display

The blue diagnostic panel shows event counts. This tells you:

```
Thinking: 0     -> No thinking events (expected for simple queries)
Content: 15     -> 15 content chunks received (GOOD!)
Tool Calls: 0   -> No tool calls (expected if query doesn't need tools)
Metrics: 1      -> Metrics received at end (GOOD!)
```

**If Content is > 0 but Results panel is empty**:
- Check console for what `event.data.content` contains
- Verify ResultsPanel is receiving the content prop
- Check ResultsPanel logs: `[ResultsPanel] Rendered with content length:`

### Step 5: Inspect Component Props

In React DevTools:
1. Select the `ResultsPanel` component
2. Check its props: Should show `content` with actual text
3. Select the `ThinkingPanel` component
4. Check its props: Should show `steps` array (may be empty for simple queries)

## Common Issues and Solutions

### Issue 1: API Returns Data But No Content Events

**Symptoms**:
- Console shows API chunks arriving
- No `[App.tsx] CONTENT event` logs
- Content counter stays at 0

**Likely Cause**: The API delta doesn't have a `content` field, or uses a different field name

**Solution**: Check the first few chunks' delta structure in console:
```javascript
[API] Chunk 1 Delta keys: ['role']
[API] Chunk 2 Delta keys: ['content']  // This is what we want to see
```

If 'content' never appears, the API might use a different field. Update api.ts line 137:
```typescript
// Check for alternative field names
if (choice.delta?.content || choice.delta?.text || choice.delta?.message) {
  const content = choice.delta.content || choice.delta.text || choice.delta.message;
  // ...
}
```

### Issue 2: Content Events Emitted But State Not Updating

**Symptoms**:
- `[App.tsx] CONTENT event` logs appear
- Content counter increases
- But `[App.tsx] Result content updated` never appears

**Likely Cause**: `event.data` structure is wrong or `event.data.content` is undefined

**Solution**: Add null checks in App.tsx:
```typescript
case 'content':
  if (!event.data || !event.data.content) {
    console.warn('[App.tsx] Content event missing data:', event);
    break;
  }
  setResultContent((prev) => prev + event.data.content);
  break;
```

### Issue 3: State Updates But Component Doesn't Render

**Symptoms**:
- `[App.tsx] Result content updated. Length: X` shows increasing values
- But ResultsPanel logs show `length: 0`

**Likely Cause**: Props not being passed correctly, or component caching

**Solution**: Check App.tsx line 330 (approx):
```typescript
<ResultsPanel content={resultContent} isLoading={isLoading} />
```

Ensure `resultContent` is the state variable, not a local variable.

### Issue 4: Everything Works But Panels Still Show "Waiting for..."

**Symptoms**:
- All logs show data flowing correctly
- Event counters show events received
- Component logs show props with data

**Likely Cause**: Conditional rendering logic in component is wrong

**Solution**: Check the conditional in ResultsPanel (line 34):
```typescript
{content ? (
  // Render content
) : (
  // Show "Waiting for..."
)}
```

Make sure `content` is truthy. If it's an empty string, the condition fails. Change to:
```typescript
{content && content.length > 0 ? (
```

Or better, check if loading is false:
```typescript
{!isLoading && (!content || content.length === 0) ? (
  // Show waiting message
) : content ? (
  // Render content
) : null}
```

## Testing Checklist

After any fixes, verify:

- [ ] Simple query "What is 2+2?" shows result in Results panel
- [ ] Event counter shows Content > 0
- [ ] Event counter shows Metrics = 1
- [ ] Metrics panel shows correct token counts and time
- [ ] Results panel displays the answer (should be "4" or explanation)
- [ ] Thinking panel shows helpful message about complex queries (not just "Waiting...")
- [ ] Tool Calls panel shows appropriate message
- [ ] Console logs show complete data flow from API to component render
- [ ] No errors in console
- [ ] Multiple queries work without page reload
- [ ] Clear button resets everything including event counters

## Removing Diagnostic Code (Production)

Before deploying to production, remove:

1. **Event counter state** (App.tsx lines 36-41)
2. **Event counter increments** (App.tsx in switch cases)
3. **Diagnostic panel display** (App.tsx lines 335-349)
4. **Excessive console.logs** (keep only errors and warnings)
   - In api.ts: Keep error logs, remove debug logs
   - In App.tsx: Keep error logs, remove event trace logs
   - In components: Remove all console.logs

Keep:
- Error logging
- Initial request logs (helpful for debugging production issues)
- Final metrics logs

## Next Steps

1. **Test with the diagnostic build**: http://localhost:4175
2. **Run test queries** and observe console output
3. **Screenshot event counter** showing which events are received
4. **Share console logs** if issues persist
5. **Check React DevTools** to inspect component props directly

The extensive logging will pinpoint exactly where the data flow breaks. Once identified, we can apply the specific fix needed.
