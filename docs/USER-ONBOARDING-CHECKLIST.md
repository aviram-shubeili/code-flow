# CodeFlow User Onboarding Checklist

This checklist guides users through the setup process for CodeFlow, ensuring they have all necessary accounts, permissions, and integrations configured correctly.

## Overview

**Setup Time:** Approximately 15-20 minutes  
**Required Permissions:** GitHub repository access, Slack workspace membership  
**Prerequisites:** Active GitHub and Slack accounts

---

## 📋 PRE-SETUP CHECKLIST

### Requirements Verification
- [ ] **GitHub Account**: Personal or organization account with repository access
- [ ] **Slack Workspace**: Member of workspace where notifications will be received
- [ ] **Repository Permissions**: Read access to repositories you want to monitor
- [ ] **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest 2 versions)

### Information to Gather
- [ ] **GitHub Repositories**: List of repositories you want to monitor for PRs
- [ ] **Slack Workspace Name**: Name/URL of your primary Slack workspace
- [ ] **Team Members**: Other developers who might benefit from CodeFlow

---

## 🚀 SETUP PROCESS

### Phase 1: CodeFlow Account Creation
- [ ] **1.1** Navigate to CodeFlow application URL
- [ ] **1.2** Click "Sign in with GitHub" button
- [ ] **1.3** Authorize CodeFlow GitHub OAuth permissions
  - Repository access (read-only)
  - User profile information
  - Pull request data access
- [ ] **1.4** Verify successful login (dashboard loads)

### Phase 2: Repository Selection
- [ ] **2.1** Access "Repository Management" section in dashboard
- [ ] **2.2** Review list of accessible repositories
- [ ] **2.3** Select repositories for PR monitoring
  - Start with 2-3 most active repositories
  - Can add more repositories later
- [ ] **2.4** Verify selected repositories appear in dashboard
- [ ] **2.5** Confirm PR data loads correctly (may take 1-2 minutes)

### Phase 3: Slack Integration Setup
- [ ] **3.1** Navigate to "Integrations" section in CodeFlow
- [ ] **3.2** Click "Connect to Slack" button
- [ ] **3.3** Select appropriate Slack workspace
- [ ] **3.4** Authorize Slack OAuth permissions
  - Send direct messages
  - Read basic workspace information
  - Access user profile
- [ ] **3.5** Configure notification preferences
  - Notification types (reviews, approvals, comments)
  - Quiet hours (e.g., 6 PM - 9 AM)
  - Frequency limits (max notifications per hour)
- [ ] **3.6** Send test notification to verify connection

### Phase 4: Dashboard Familiarization
- [ ] **4.1** Review four-section dashboard layout
  - **"Needs Review"**: PRs assigned to you for review
  - **"Returned to You"**: Your PRs with feedback to address
  - **"My PRs"**: All your PRs and their current status
  - **"Reviewed-Awaiting"**: PRs you've reviewed, awaiting author action
- [ ] **4.2** Test PR card interactions
  - Hover for additional details
  - Click to open GitHub PR in new tab
- [ ] **4.3** Use manual refresh button to update data
- [ ] **4.4** Verify data freshness indicators work correctly

---

## 🔧 WORKSPACE ADMIN TASKS

*If you're setting up CodeFlow for your team, additional admin steps may be required.*

### Slack Workspace Configuration
- [ ] **A.1** Review Slack app approval settings
- [ ] **A.2** If required, submit CodeFlow for workspace admin approval
  - Go to Slack Admin → Apps → Manage
  - Search for CodeFlow or paste app installation URL
  - Review permissions and approve
- [ ] **A.3** Consider enabling org-wide installation for team members

### GitHub Organization Setup
- [ ] **B.1** If using GitHub organization repositories:
  - Verify CodeFlow app has organization access
  - Review third-party app access policies
  - Consider adding CodeFlow to approved apps list
- [ ] **B.2** Communicate setup process to team members

---

## ✅ VERIFICATION & TESTING

### Functionality Tests
- [ ] **T.1** Create a test PR in one of your monitored repositories
- [ ] **T.2** Verify PR appears in "My PRs" section within 2-5 minutes
- [ ] **T.3** Request review from a colleague
- [ ] **T.4** Verify PR moves to appropriate section for reviewer
- [ ] **T.5** Check Slack notification arrives for review request
- [ ] **T.6** Add comment or review to test PR
- [ ] **T.7** Verify Slack notification for PR author
- [ ] **T.8** Refresh dashboard manually and verify data updates

### Performance Validation
- [ ] **P.1** Dashboard loads under 2 seconds
- [ ] **P.2** PR data refreshes automatically (check timestamps)
- [ ] **P.3** Slack notifications arrive within 2-5 minutes of PR changes
- [ ] **P.4** No errors in browser console during normal usage

---

## 🛠️ TROUBLESHOOTING

### Common Issues & Solutions

**GitHub Authorization Problems**
- **Issue**: "Access denied" or missing repositories
- **Solution**: Re-authorize GitHub OAuth, ensure repository permissions granted
- **Check**: Repository visibility settings (private repos need explicit access)

**Slack Notifications Not Arriving**
- **Issue**: No Slack messages received
- **Solution**: 
  1. Verify Slack OAuth connection in CodeFlow settings
  2. Check notification preferences aren't too restrictive
  3. Confirm you're not in quiet hours
  4. Send test notification from CodeFlow

**Dashboard Not Loading PRs**
- **Issue**: Empty dashboard or "No PRs found"
- **Solution**:
  1. Verify repository selection is correct
  2. Check that repositories have open PRs
  3. Wait 2-5 minutes for initial data sync
  4. Try manual refresh button

**Performance Issues**
- **Issue**: Slow dashboard loading
- **Solution**:
  1. Check internet connection
  2. Clear browser cache and cookies
  3. Try different browser
  4. Reduce number of monitored repositories temporarily

### Support Contacts
- **Technical Issues**: [Support email/channel]
- **GitHub Access Problems**: Contact repository admin
- **Slack Integration Issues**: Contact Slack workspace admin

---

## 🎯 SUCCESS CRITERIA

You've successfully completed onboarding when:
- [ ] Dashboard loads quickly and shows accurate PR data
- [ ] All four dashboard sections display relevant PRs correctly
- [ ] Slack notifications arrive for PR status changes
- [ ] You can successfully navigate from Slack notification to relevant PR
- [ ] Team members can install and configure CodeFlow independently

---

## 📚 NEXT STEPS

### Team Adoption
- [ ] Share CodeFlow with team members
- [ ] Create team onboarding session (15-20 minutes)
- [ ] Establish team notification preferences and etiquette
- [ ] Set up CodeFlow monitoring for all critical repositories

### Optimization
- [ ] Fine-tune notification preferences based on usage patterns
- [ ] Add additional repositories as needed
- [ ] Review team dashboard usage after 1 week
- [ ] Provide feedback for product improvements

### Advanced Features (Post-MVP)
- [ ] Explore filtering and grouping options (when available)
- [ ] Set up team-wide analytics and reporting (future feature)
- [ ] Integrate with additional communication platforms (future feature)

---

## 📞 Getting Help

**Documentation**: [Link to CodeFlow documentation]  
**Video Tutorial**: [Link to setup walkthrough video]  
**Team Slack**: [#codeflow-support channel]  
**Email Support**: [support@codeflow.com]

**Emergency Contact**: If CodeFlow is critical to your workflow and you experience issues, contact [emergency support details].

---

*Last Updated: September 9, 2025*  
*Version: MVP 1.0*