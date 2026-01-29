# Testing Guide for CodeFlow POC

This guide provides step-by-step instructions for testing the CodeFlow extension.

## Prerequisites

- VS Code 1.85.0 or higher
- Node.js and npm installed
- GitHub account with repositories
- GitHub Personal Access Token

## Setup for Testing

### 1. Install Dependencies

```bash
cd /home/runner/work/code-flow/code-flow
npm install
```

### 2. Build the Extension

```bash
npm run compile
```

Expected output: `[watch] build finished successfully`

### 3. Launch Extension Development Host

**Option A: Using VS Code**
1. Open the project in VS Code
2. Press `F5`
3. This opens a new "Extension Development Host" window

**Option B: Using Command Line**
```bash
# Watch mode for live reloading
npm run watch
```

Then press F5 in VS Code.

## Test Cases

### Test 1: Initial Setup

**Objective**: Verify authentication flow works correctly

**Steps:**
1. In Extension Development Host window, open Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type and select: `CodeFlow: Authenticate with GitHub`
3. Enter your GitHub PAT
4. Verify you see: "Successfully authenticated with GitHub!"

**Expected Results:**
- ✅ Token input dialog appears
- ✅ Token is validated (format check)
- ✅ Success message shown
- ✅ No errors in Developer Console

**Test Invalid Token:**
1. Enter an invalid token (e.g., "invalid")
2. Should see error: "Invalid token format..."

### Test 2: Dashboard Opening

**Objective**: Verify dashboard loads and displays

**Steps:**
1. Open Command Palette
2. Type and select: `CodeFlow: Open Dashboard`
3. Wait for dashboard to load

**Expected Results:**
- ✅ Dashboard panel opens
- ✅ Shows "Loading pull requests..." initially
- ✅ Four sections appear: Needs Review, Returned to You, My PRs, Reviewed-Awaiting
- ✅ Section counts displayed
- ✅ Last updated timestamp shown
- ✅ Refresh button visible

### Test 3: PR Data Display

**Objective**: Verify PRs are fetched and categorized correctly

**Prerequisites:**
- Have some open PRs in GitHub
- Be assigned as reviewer on at least one PR
- Have at least one of your own PRs

**Steps:**
1. Open dashboard
2. Wait for data to load
3. Verify each section

**Expected Results:**

**Needs Review Section:**
- ✅ Shows PRs where you're requested as reviewer
- ✅ Each card shows: title, repo/name, number, author, time ago, comments
- ✅ Status badge displayed if present

**Returned to You Section:**
- ✅ Shows your PRs with CHANGES_REQUESTED status
- ✅ Highlighted differently (if applicable)

**My PRs Section:**
- ✅ Shows all your open PRs
- ✅ Includes approval status badges
- ✅ Shows comment counts

**Reviewed-Awaiting Section:**
- ✅ Shows PRs you reviewed (simplified in POC)

### Test 4: PR Card Interaction

**Objective**: Verify clicking PRs opens GitHub

**Steps:**
1. In dashboard, click on any PR card
2. Verify browser opens
3. Verify correct PR page loads

**Expected Results:**
- ✅ Browser opens automatically
- ✅ Correct GitHub PR URL loads
- ✅ Dashboard remains open in VS Code

### Test 5: Manual Refresh

**Objective**: Verify manual refresh updates data

**Steps:**
1. Note current "Last updated" time
2. Click "Refresh" button
3. Verify timestamp updates
4. Verify data is refreshed

**Expected Results:**
- ✅ Timestamp updates to current time
- ✅ PR data refreshes
- ✅ Any new PRs appear
- ✅ No errors shown

### Test 6: Automatic Polling

**Objective**: Verify background polling works

**Steps:**
1. Open dashboard
2. Wait 60 seconds
3. Observe automatic refresh

**Expected Results:**
- ✅ Dashboard updates automatically after 60 seconds
- ✅ Timestamp updates
- ✅ No user action required
- ✅ Works even when dashboard not focused

### Test 7: Notifications

**Objective**: Verify notifications appear for PR changes

**Setup:**
This requires making changes on GitHub:

**Test New Review Request:**
1. Have someone assign you as reviewer on a PR
2. Wait up to 60 seconds for poll
3. Verify notification appears

**Expected Result:**
```
┌──────────────────────────────────────┐
│ 📋 Review requested: [PR Title]      │
│  [View PR]  [Open Dashboard]         │
└──────────────────────────────────────┘
```

**Test Changes Requested:**
1. Have someone request changes on your PR
2. Wait for notification

**Expected Result:**
```
┌──────────────────────────────────────┐
│ 🔄 Changes requested on: [PR Title]  │
│  [View PR]  [Open Dashboard]         │
└──────────────────────────────────────┘
```

**Test Approval:**
1. Have someone approve your PR
2. Wait for notification

**Expected Result:**
```
┌──────────────────────────────────────┐
│ ✅ PR approved: [PR Title]           │
│  [View PR]  [Open Dashboard]         │
└──────────────────────────────────────┘
```

### Test 8: Notification Actions

**Objective**: Verify notification buttons work

**Steps:**
1. When notification appears, click "View PR"
2. Verify browser opens to PR
3. Trigger another notification, click "Open Dashboard"
4. Verify dashboard opens/focuses

**Expected Results:**
- ✅ "View PR" opens browser to correct PR
- ✅ "Open Dashboard" opens/focuses dashboard
- ✅ Notification dismisses after action

### Test 9: Empty States

**Objective**: Verify empty states display correctly

**Setup:**
- Use a GitHub account with no PRs, or
- Test with repositories where you have no activity

**Steps:**
1. Open dashboard with account that has no PRs
2. Verify empty state messages

**Expected Results:**
- ✅ Each section shows "No pull requests"
- ✅ No errors displayed
- ✅ Dashboard still functional

### Test 10: Error Handling

**Objective**: Verify graceful error handling

**Test Invalid Token:**
1. Delete token from SecretStorage (re-authenticate with invalid token format that passes initial validation but fails API call)
2. Open dashboard
3. Verify error message shown

**Test Network Error:**
1. Disconnect from internet
2. Try to refresh dashboard
3. Verify graceful failure

**Expected Results:**
- ✅ Error message displayed
- ✅ No crashes
- ✅ Dashboard remains usable
- ✅ Can retry after fixing issue

### Test 11: Multiple Refreshes

**Objective**: Verify repeated refreshes work correctly

**Steps:**
1. Click Refresh button multiple times quickly
2. Verify no errors
3. Verify data loads correctly

**Expected Results:**
- ✅ Multiple refreshes handled gracefully
- ✅ No duplicate data
- ✅ Latest data shown
- ✅ No memory leaks

### Test 12: Dashboard Persistence

**Objective**: Verify dashboard state persists

**Steps:**
1. Open dashboard
2. Close dashboard panel
3. Re-open dashboard
4. Verify data still there

**Expected Results:**
- ✅ Dashboard re-opens showing data
- ✅ No need to re-fetch immediately
- ✅ Background polling continues

## Performance Testing

### Load Testing

**Objective**: Verify performance with various PR counts

**Test Cases:**
- 0 PRs
- 5-10 PRs
- 20-30 PRs
- 50+ PRs (if available)

**Metrics to Check:**
- Dashboard load time (target: <2 seconds)
- Refresh time
- Memory usage (check VS Code Task Manager)
- CPU usage during polling

### API Usage Testing

**Objective**: Monitor API calls and rate limiting

**Steps:**
1. Enable DevTools (Help > Toggle Developer Tools)
2. Open Network tab
3. Refresh dashboard
4. Monitor API calls

**Expected Results:**
- ✅ GraphQL queries efficient
- ✅ No excessive API calls
- ✅ Rate limits respected
- ✅ Proper error handling if rate limited

## Developer Console Checks

**What to Monitor:**
1. Open Developer Tools (Help > Toggle Developer Tools)
2. Check Console tab for errors
3. Verify no red errors during normal operation
4. Check for any warnings

**Expected:**
- ✅ No TypeScript errors
- ✅ No runtime errors
- ✅ Clean console output
- ℹ️ Info logs only (e.g., "CodeFlow extension is now active")

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** Run `CodeFlow: Authenticate with GitHub` again

### Issue: No PRs showing
**Solutions:**
- Verify you have open PRs on GitHub
- Check you're assigned as reviewer
- Click Refresh button
- Verify token has correct scopes

### Issue: Dashboard won't open
**Solutions:**
- Check Developer Console for errors
- Restart Extension Development Host
- Rebuild extension (`npm run compile`)

### Issue: Notifications not appearing
**Solutions:**
- Wait full 60 seconds for polling cycle
- Verify PR state actually changed on GitHub
- Check notification state hasn't already tracked this change

## Reporting Issues

When reporting issues, include:
1. VS Code version
2. Extension version (0.1.0)
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (from Developer Tools)
6. Screenshots if applicable

## Success Criteria

POC testing is successful if:
- ✅ All authentication flows work
- ✅ Dashboard loads in <2 seconds
- ✅ PRs categorized correctly
- ✅ Manual refresh works
- ✅ Automatic polling works
- ✅ Notifications appear for changes
- ✅ No crashes or critical errors
- ✅ Performance acceptable (50+ PRs)

---

**Happy Testing! 🧪**
