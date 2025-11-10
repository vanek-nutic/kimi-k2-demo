# Quick Testing Guide

## Application Access
**URL:** http://localhost:5180

## Before You Start
1. Open browser DevTools (F12)
2. Go to Console tab to see detailed logs
3. Logs are prefixed with `[API]` or `[PDF Export]` for easy filtering

## Quick Test Sequence

### Test 1: Basic Functionality (2 minutes)
```
1. Enter query: "What is 2+2?"
2. Click "Submit Query"
3. Watch console for logs starting with "[API]"
4. Verify result appears in Results panel (should say "2 + 2 = 4" or similar)
5. Verify metrics update (tokens, elapsed time)
```

**Success Criteria:**
- ✅ Console shows: `[API] Starting queryKimiK2`
- ✅ Console shows: `[API] Emitting content chunk`
- ✅ Console shows: `[API] Emitting done event`
- ✅ Results panel shows the answer
- ✅ Metrics panel shows numbers (not all zeros)

### Test 2: Empty Query Validation (30 seconds)
```
1. Clear the query field
2. Click "Submit Query"
```

**Success Criteria:**
- ✅ Red error banner appears with message
- ✅ No API call made (no `[API]` logs in console)

### Test 3: PDF Export (1 minute)
```
1. After Test 1 completes (with results visible)
2. Click "Export PDF" button
3. Watch console for "[PDF Export]" logs
```

**Success Criteria:**
- ✅ Console shows: `[PDF Export] Starting export...`
- ✅ Console shows: `[PDF Export] PDF saved successfully`
- ✅ PDF file downloads to your Downloads folder
- ✅ PDF filename includes timestamp

### Test 4: Complex Query (3 minutes)
```
1. Click "Example 1" button (or enter a complex query)
2. Click "Submit Query"
3. Watch all panels for activity
```

**Success Criteria:**
- ✅ Loading spinner appears during processing
- ✅ Results panel populates with content
- ✅ Metrics update in real-time
- ✅ No errors in console
- ✅ App doesn't hang or freeze

## Console Log Patterns to Look For

### Successful API Call:
```
[API] Starting queryKimiK2 with query: What is 2+2?
[API] Making fetch request to: https://api.moonshot.ai/v1/chat/completions
[API] Fetch response received. Status: 200 OK: true
[API] Starting to read response stream...
[API] Chunk 1 Full response: {...}
[API] Emitting content chunk. Total length so far: 1
[API] Emitting content chunk. Total length so far: 2
...
[API] Stream reading completed. Total chunks: X
[API] Stream complete. Content buffer length: X
[API] Emitting final metrics: {...}
[API] Emitting done event
```

### PDF Export Success:
```
[PDF Export] Starting export...
[PDF Export] Query: What is 2+2?
[PDF Export] Result content length: X
[PDF Export] Creating PDF document...
[PDF Export] PDF initialized. Page dimensions: {...}
[PDF Export] Saving PDF as: kimi-k2-report-TIMESTAMP.pdf
[PDF Export] PDF saved successfully
```

## Troubleshooting

### Issue: No results appear
**Check:**
1. Look for `[API] Error occurred:` in console
2. Verify `.env` file has valid API key
3. Check network tab in DevTools for failed requests

### Issue: PDF doesn't download
**Check:**
1. Look for `[PDF Export] Error` in console
2. Ensure you ran a query first (have results)
3. Check browser's download settings/blockers

### Issue: App hangs/freezes
**Check:**
1. Look at last log entry in console
2. Check if you see `[API] Stream reading completed`
3. Look for JavaScript errors in console

## Expected Behavior

### What Should Work:
- ✅ Submitting queries and getting responses
- ✅ Seeing results in the Results panel
- ✅ Metrics updating (tokens, time)
- ✅ Loading indicators while processing
- ✅ Error messages when something fails
- ✅ PDF export after getting results
- ✅ Empty query validation

### What Might Not Always Work:
- ⚠️ **Thinking Panel**: May show "Waiting for thinking steps..." - This is normal! The API doesn't always provide reasoning content for simple queries.
- ⚠️ **Tool Calls Panel**: May show "Waiting for tool calls..." - This is normal! Not all queries require tool usage.

## Performance Notes

- Simple queries (like "What is 2+2?"): ~1-2 seconds
- Complex queries: 5-30 seconds depending on complexity
- PDF generation: < 1 second

## Log Filtering in DevTools

To focus on specific parts:
- Filter by `[API]` to see only API-related logs
- Filter by `[PDF Export]` to see only PDF logs
- Filter by `Error` to see only errors

## Quick Verification

If you only have 30 seconds, run this:
```
1. Enter "test" in query field
2. Click Submit
3. Look for results appearing
4. Click Export PDF
5. Verify PDF downloads
```

If these work, the app is functional!
