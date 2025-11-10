# Diagnostic Build - Quick Start Guide

## TL;DR

**Problem**: Panels not showing data
**Solution**: Added comprehensive logging to trace data flow
**Status**: Ready to test
**URL**: http://localhost:4175

---

## Quick Test (5 minutes)

### 1. Open Application
```
http://localhost:4175
```

### 2. Open Browser Console
Press **F12** → Console tab → Clear logs

### 3. Submit Test Query
```
What is 2+2?
```

### 4. Look for Blue Diagnostic Box
Should appear below the query input:
```
Debug - Events Received:
Thinking: 0    Content: 15    Tool Calls: 0    Metrics: 1
```

### 5. Check Results

**If Content > 0 AND Results panel shows answer**:
✓ Everything works!

**If Content > 0 BUT Results panel empty**:
→ Component rendering issue
→ Check console for `[ResultsPanel]` logs
→ See DEBUGGING_GUIDE.md Section "Issue 4"

**If Content = 0**:
→ API not emitting content events
→ Check console for `[API] Chunk X Delta keys:`
→ Look for 'content' in the keys array
→ See DEBUGGING_GUIDE.md Section "Issue 1"

---

## What the Logs Mean

### Good Sequence (Working)
```
[API] Starting queryKimiK2...           ← API called
[API] Chunk 1 Delta keys: ["content"]   ← API has content
[API] Emitting content chunk...         ← Event emitted
[App.tsx] Event received: content       ← Event received
[App.tsx] Result content updated...     ← State updated
[ResultsPanel] Content changed...       ← Component rendered
```

### Bad Sequence (Broken)
```
[API] Starting queryKimiK2...           ← API called
[API] Chunk 1 Delta keys: ["role"]      ← No content field!
[API] Stream complete...                ← No content emitted
[App.tsx] Event received: metrics       ← Only metrics received
```

**Problem**: API delta doesn't have 'content' field

---

## Event Counter Guide

### Normal Simple Query
```
Thinking: 0         ← Expected (simple queries don't think)
Content: 10-50      ← MUST be > 0
Tool Calls: 0       ← Expected (no tools needed)
Metrics: 1          ← Always 1
```

### If All Zeros
```
Thinking: 0
Content: 0    ← BAD! Should have content
Tool Calls: 0
Metrics: 0    ← BAD! Should have metrics
```
**Problem**: API call failed or events not emitting

### If Only Metrics
```
Thinking: 0
Content: 0    ← BAD! Should have content
Tool Calls: 0
Metrics: 1    ← Good
```
**Problem**: API completes but content not in delta

---

## Quick Fixes

### Fix 1: No Content Events
**If**: Event counter shows `Content: 0`
**Check**: Console for `[API] Chunk X Delta keys:`
**Look for**: Is 'content' in the array?
**Fix**: If different field name, update api.ts line 137

### Fix 2: Content Events But Panel Empty
**If**: Event counter shows `Content: 15` but Results panel empty
**Check**: Console for `[ResultsPanel] Content changed, length:`
**Look for**: Does it show length > 0?
**Fix**: If yes, check ResultsPanel conditional (line 34)

### Fix 3: State Not Updating
**If**: `[App.tsx] CONTENT event` logs but no `Result content updated`
**Check**: `[App.tsx] CONTENT event - data:` log
**Look for**: Is `event.data.content` defined?
**Fix**: Add null check before accessing

---

## Common Scenarios

### Scenario: "Everything logs but panel empty"
**Symptoms**:
- Content events received ✓
- State updated ✓
- Component receives props ✓
- But still shows "Waiting for results..."

**Root Cause**: Conditional rendering logic
**Location**: ResultsPanel.tsx line 34
**Fix**: Check the `{content ? (...) : (...)}` conditional

---

### Scenario: "Only metrics work"
**Symptoms**:
- Metrics panel updates ✓
- Event counter shows: Content: 0
- All other panels empty

**Root Cause**: API response structure
**Location**: api.ts line 137 (content check)
**Fix**: API might use different field name

---

### Scenario: "No events at all"
**Symptoms**:
- Event counter doesn't appear
- No `[App.tsx]` logs in console
- Only `[API]` logs

**Root Cause**: Event callback not connected
**Location**: App.tsx line 77, api.ts onEvent calls
**Fix**: Verify onEvent is being called

---

## Files to Check

### If API Issues
- `src/lib/api.ts` - Check delta field access
- Lines 120-122: Thinking content check
- Line 137: Regular content check

### If Event Issues
- `src/App.tsx` - Check event handler
- Line 77: Is callback passed to queryKimiK2?
- Lines 79-152: Switch statement handling

### If Rendering Issues
- `src/components/ResultsPanel.tsx` - Check conditional
- Line 34: `{content ? (...) : (...)}`
- Line 14: Check props received

---

## Next Steps

### If Everything Works
1. Results panel shows answer ✓
2. Event counter appears ✓
3. Console shows data flow ✓
→ Remove diagnostic code (see PANEL_DISPLAY_FIXES.md "Cleanup")

### If Something Broken
1. Screenshot event counter
2. Copy ALL console logs
3. Check DEBUGGING_GUIDE.md for specific issue
4. Share findings

---

## Documentation

**Detailed Debugging**: `DEBUGGING_GUIDE.md`
**Technical Details**: `PANEL_DISPLAY_FIXES.md`
**Complete Overview**: `COMPREHENSIVE_FIX_REPORT.md`
**This Guide**: `DIAGNOSTIC_QUICK_START.md`

---

## One-Line Summary

**Open http://localhost:4175, submit "What is 2+2?", check if event counter shows Content > 0 and Results panel displays answer.**

If yes → Working!
If no → Check console logs and see which step fails.
