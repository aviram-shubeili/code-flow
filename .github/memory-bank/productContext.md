# CodeFlow - Product Context

**Last Updated:** 2025-07-23

## The Problem We're Solving

### Developer Pain Points
1. **Information Overload:** GitHub notifications and PR lists become overwhelming in active repositories
2. **Action Confusion:** Difficulty quickly identifying which PRs require YOUR specific attention vs. general awareness
3. **Status Tracking:** Uncertainty about the current state of PRs you've authored or reviewed
4. **Context Switching:** Constantly navigating GitHub's interface to piece together your PR landscape
5. **Workflow Inefficiency:** Time wasted determining what needs action vs. what's just noise

### Current State Problems
- GitHub's interface mixes ALL repository activity together
- No clear separation between "needs my review" vs. "needs my action as author"
- Difficult to track PRs you've reviewed that are now awaiting author updates
- No unified view of your complete PR workload across projects

## The Solution: CodeFlow Dashboard

### Core Value Proposition
**"Your personal PR command center - see what needs your attention, when it needs it, without the noise."**

### How It Works
1. **Authenticate:** Secure GitHub OAuth integration
2. **Categorize:** Intelligent sorting of PRs by your relationship to them
3. **Prioritize:** Clear visual hierarchy showing what needs immediate attention
4. **Act:** Direct links to GitHub for seamless workflow integration

### User Experience Goals

#### Immediate Clarity
- Within 3 seconds of loading, user knows exactly what requires their attention
- Color-coded status badges provide instant visual feedback
- Clear section headers eliminate cognitive load

#### Effortless Navigation
- One-click access to any PR on GitHub
- Responsive design works on desktop and laptop screens
- Fast load times and smooth interactions

#### Actionable Information
- Show exactly the data needed for decision-making
- Avoid information overload with carefully curated PR details
- Context-aware status indicators

### Target User Journey

1. **Morning Check-in:** "What PRs need my review today?"
2. **Work Session:** "Did anyone respond to my PR feedback?"
3. **End of Day:** "What's the status of PRs I submitted?"
4. **Follow-up:** "Which PRs are blocked waiting for authors after my review?"

### Success Metrics (MVP)
- **Time to Action:** Reduce time from login to identifying actionable PRs
- **Context Clarity:** Eliminate confusion about PR status and required actions
- **Workflow Integration:** Seamless transition between CodeFlow and GitHub
- **Personal Productivity:** Improved PR management efficiency for individual developers

## Detailed Functional Requirements

### Core Dashboard Sections (MVP)
1. **Needs Your Review**
   - PRs where user is assigned reviewer, open, not yet approved
   - **Status Badges:** "Needs Review" (Amber) / "Needs Re-Review" (Pink)
   - Differentiates first review vs. re-review after author updates

2. **Returned to You** 
   - PRs authored by user with "Changes Requested" status
   - **Status Badge:** "Changes Requested" (Red)

3. **My PRs - Awaiting Review**
   - User's open PRs not blocked, awaiting review/approval
   - **Status Badge:** "Awaiting Review" (Blue/Grey)

4. **Reviewed - Awaiting Author** (Conditional)
   - PRs where user requested changes, awaiting author action
   - **Status Badge:** "Awaiting Author Action" (Red)
   - Only included if GitHub API supports straightforward filtering

### Required PR Card Data
- Author's Profile Picture (Avatar)
- PR ID/Number with clickable link to GitHub
- PR Title
- Author's Username ("Opened by...")
- Status Badge (color-coded by section)
- Total Comment Count
- Last Update Timestamp (relative time)
- Code Changes Summary (+XX / -YY)

### User Experience Requirements
- **Manual Refresh:** User-controlled data updates
- **Loading States:** Clear indicators during data fetching
- **Empty States:** Informative messages when sections are empty
- **Error Handling:** User-friendly error messages with retry options
- **Responsive Design:** Desktop/laptop focused with basic mobile support

## Competitive Landscape

### GitHub Native Interface
- **Strengths:** Complete feature set, authoritative source
- **Weaknesses:** Generic interface, no personal workflow optimization

### Why CodeFlow Is Different
- **Personal Focus:** Designed for individual developer workflow, not repository management
- **Action-Oriented:** Organized by what YOU need to do, not chronological activity
- **Simplified Interface:** Only shows information relevant to decision-making
- **Learning Project:** Built with modern stack showcasing best practices

## Future Vision (Post-MVP)

### Phase 2 Possibilities
- Multi-repository aggregation
- Basic team views for leads
- Notification preferences
- Performance metrics

### Phase 3+ Possibilities
- Slack/Teams integration
- Advanced filtering and search
- PR analytics and insights
- Team workflow optimization

The MVP focuses exclusively on the individual developer experience to validate core value before expanding scope.
