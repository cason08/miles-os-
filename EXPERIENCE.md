# MilesOS — Experience Guide

This document defines how MilesOS should *feel* to use. It is the emotional companion to [PRODUCT.md](./PRODUCT.md) (what to build), [ARCHITECTURE.md](./ARCHITECTURE.md) (how it's built), and [NAVIGATION.md](./NAVIGATION.md) (how it's organised) — none of which say anything about how a moment in the app should land emotionally. This document does not describe colour, typography, or layout, and it does not design the interface. Every future interface decision should be checked against this document the way every technical decision is checked against PRODUCT.md's principles.

## 1. Product Vision

MilesOS should make me feel **quietly in control of money I used to have to think hard about**. Not excited, not gamified, not anxious — in control, the way a well-run system feels rather than the way a chore feels. Checking it should feel like glancing at a trusted advisor's morning briefing: someone already did the work, already checked the numbers, and will tell me the one thing that actually matters today. Most days, that briefing is short, because most days nothing needs my attention — and that itself should feel reassuring, not suspicious.

Over the long run, MilesOS should make me feel like my financial life is *legible* — that I could explain my own net worth, spending, and rewards position to someone else at any moment, without having to go dig for it. That's the feeling a personal financial operating system owes me that a budgeting app never did (PRODUCT.md §1).

## 2. Emotional Design Principles

These govern every product, writing, and interaction decision, the same way PRODUCT.md's Core Product Principles govern engineering decisions.

- **Calm before urgency.** The default emotional register is calm. Urgency is earned by the situation, never used as a default attention-getting device.
- **Confidence before complexity.** Show the conclusion first, the detail on request. I should never have to do arithmetic in my head to understand whether something is good or bad.
- **Encourage, never shame.** Overspending, a missed budget, or a parsing mistake are information, not verdicts on my character.
- **Explain, never overwhelm.** Every number is allowed to come with one sentence of "why." It is never allowed to come with a wall of them.
- **Celebrate progress.** Movement in the right direction is noticed and named, however small, without turning the app into a game.
- **Reduce decision fatigue.** Where the system already knows the answer (which card, which category), it says so — it doesn't make me choose from a menu of possibilities it could have ranked itself.
- **Trust through transparency.** Every recommendation and insight shows its reasoning (this is Principle 7 in PRODUCT.md, made emotional rather than functional) — trust is earned by being shown the work, not by being asked to believe a black box.
- **Automation earns silence.** Because most of the app runs itself, the times it *does* speak carry weight. Silence is not absence of value; it's the reward for automation working.

## 3. AI Behaviour

**When the AI should speak:**
- When something is genuinely actionable and not already obvious from a glance at Home — a card that would have earned more, a category trending the wrong way, a subscription that looks abandoned.
- When it needs my judgment because it can't decide for itself — a potential duplicate, a low-confidence categorisation, a parsing result it isn't sure about.
- When a real milestone or threshold is crossed — a bonus cap reached, a month closed, a savings goal hit.

**When the AI should stay silent:**
- When nothing has changed that I couldn't already see on Home. Restating a visible number as a "notification" is noise, not help.
- When it would be offering encouragement for its own sake ("looking good today!") rather than in response to something real. Manufactured positivity is as untrustworthy as manufactured alarm.
- When it isn't confident. An uncertain insight framed as a confident one erodes trust faster than saying nothing.

**How recommendations should be presented:** as an observation plus a reason, never as an instruction. "Use the Woman's World card — you've got S$240 of bonus spend left this month" reads as a tip from someone who already ran the numbers, not a command. Recommendations are framed forward ("here's what would help") never backward ("you should have"). One clear best answer is offered, not a ranked list of five options to weigh — the whole point is removing the decision, not relocating it.

**How proactive the assistant should be:** proactive in *substance*, restrained in *frequency*. The Insights Engine (PRODUCT.md §5) and Notifications (§6.7) exist precisely so the AI doesn't have to interrupt me to be useful — it does its thinking on a schedule and hands me a small, curated set of things worth knowing, rather than a running commentary. The right mental model is a sharp analyst who checks in once a day with a short brief, not a chat window that's always trying to talk to me.

## 4. Micro-interactions

- **Opening the app.** No sense of waiting for the truth to load — the first thing on screen should already read as current and correct. The feeling is "nothing has been hiding from me," not "let me check if anything broke overnight."
- **A new transaction arriving.** Matter-of-fact acknowledgement, not an alert. It's the system doing its job (zero manual entry, PRODUCT.md Principle 1), so it should feel as unremarkable as a text message being delivered — present, but not announced like news.
- **Approaching or reaching a budget limit.** Approaching: a gentle heads-up, framed around what's left, not what's been lost. Reaching or exceeding: neutral and specific ("Dining is over for the month by S$40") with a next step, never a scolding tone or visual alarm-register language.
- **Receiving a recommendation.** Should feel like being handed something useful right when it's needed, not like being tested. The reasoning should already be visible — there's no moment where I have to wonder "why is it telling me this?"
- **Completing onboarding.** A real sense of accomplishment — I just told the system everything it needs to run itself from now on, and Home immediately proves it by showing a correct, real Net Worth. That payoff has to be immediate; onboarding effort that doesn't immediately show a result feels wasted.
- **Finishing a month.** A brief, warm recap — regardless of whether the month was "good" by the numbers. The emotional job of a month-end moment is to make reflection feel welcome, not evaluative; there's always something true and positive to say (miles earned, a category that improved, a habit that held), even in a month that ran over budget.

## 5. Writing Style

Every string of text in MilesOS — labels, notifications, insights, errors, onboarding copy — reads like it was written by a sharp, warm, financially literate friend, not a system.

- **Plain language over financial jargon.** If a sentence needs a glossary, rewrite the sentence.
- **Second person, present tense.** "You've got S$240 left," not "The user has a remaining balance of."
- **Concrete over abstract.** Real numbers and real merchant/category names, not "your spending has changed."
- **Confident, not hedgy.** Say what's true plainly; reserve visible uncertainty for when the system is genuinely uncertain (§3), rather than hedging everything defensively.
- **Warm, not cute.** No forced enthusiasm, no exclamation marks doing emotional labour the sentence itself should be doing, no gamified mascot voice.
- **Never shaming, never robotic.** Neither "You failed your budget" nor "ERR_BUDGET_EXCEEDED" — the register sits between those two failure modes, always.
- **Short.** One idea per sentence, one sentence per point where possible. If an insight needs three paragraphs to land, it needed a better first sentence.

## 6. Success Moments

Moments that should be allowed to feel genuinely rewarding, not just functionally correct:

- The first transaction that appears automatically, with zero manual entry — the moment the core promise of the product proves itself.
- Following a card recommendation and later seeing the extra miles it earned show up.
- A category staying under budget for the first time, or for a personal-best streak.
- Crossing a personal miles/points milestone.
- An insight that catches something I'd genuinely missed — a forgotten subscription, an under-used card — and saves real money.
- Net worth visibly trending upward over a run of months.
- Reconnecting Gmail in under a minute after a disconnect and watching the sync catch back up, with nothing lost.

## 7. Failure Moments

Errors are the moments trust is actually built or broken — they're handled so that being wrong never feels like being caught out.

- **A transaction is parsed incorrectly.** Framed as "help us get this right," not "you have to fix our mistake." The correction is fast, and the system visibly learns from it (merchant memory, PRODUCT.md §6.3) so the same fix is never needed twice.
- **A potential duplicate is flagged.** Presented as a quick yes/no check, not an accusation that something went wrong — flagging a duplicate *is* the system working as intended, not a bug surfacing.
- **The Gmail connection breaks.** Calm and specific ("Gmail needs to be reconnected — nothing has been missed") rather than alarming, with a fast, obvious path back to normal. The emotional goal is "minor errand," never "something is broken."
- **A budget is exceeded.** Stated as fact plus a path forward, never as a verdict. The system's job is to inform, not to judge a month that's already happened.
- **A sync delay or transient failure occurs.** Transparent about what's true right now (data isn't lost, it's just not current yet) rather than silent — silence during a failure is what turns a minor hiccup into a trust problem.

The general rule: every failure state is written from a posture of system humility ("we're not sure — can you confirm?") rather than user blame ("you did this wrong"), because in almost every case in this product, the failure is the AI's uncertainty, not my mistake.

## 8. Product Philosophy

MilesOS should feel less like a budgeting app you dutifully check and more like a calm, competent co-pilot for your financial life — always watching, rarely speaking, and able to explain exactly why every single time it does.
