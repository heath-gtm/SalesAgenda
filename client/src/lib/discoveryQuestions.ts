interface DiscoveryQuestion {
  question: string;
  focus: string;
  category: 'pain_point' | 'current_state' | 'decision_process' | 'technical' | 'business_value';
}

const discoveryQuestions: Record<string, DiscoveryQuestion[]> = {
  discovery: [
    {
      question: "What challenges are you currently facing with your existing tools or processes?",
      focus: "Identifying core pain points and friction areas",
      category: 'pain_point'
    },
    {
      question: "How are you currently measuring success in this area, and what metrics matter most?",
      focus: "Understanding current KPIs and success criteria",
      category: 'current_state'
    },
    {
      question: "What would need to happen for this to be considered a successful initiative?",
      focus: "Defining success criteria and desired outcomes",
      category: 'business_value'
    },
    {
      question: "Who else is involved in evaluating and making decisions about solutions like this?",
      focus: "Mapping the decision-making process and stakeholders",
      category: 'decision_process'
    },
    {
      question: "What's driving the urgency to address this now versus six months from now?",
      focus: "Understanding timeline and business urgency",
      category: 'business_value'
    }
  ],
  demo: [
    {
      question: "Based on what you've seen, which capabilities would have the biggest impact on your team?",
      focus: "Identifying high-value features and use cases",
      category: 'business_value'
    },
    {
      question: "How does this compare to your current workflow and what you've seen from other vendors?",
      focus: "Competitive positioning and differentiation",
      category: 'current_state'
    },
    {
      question: "What concerns or questions do you have about implementing something like this?",
      focus: "Uncovering objections and implementation concerns",
      category: 'pain_point'
    },
    {
      question: "What would need to be included in a solution for you to feel confident moving forward?",
      focus: "Requirements gathering and closing criteria",
      category: 'decision_process'
    },
    {
      question: "How quickly would you want to see results, and what would those look like?",
      focus: "Timeline expectations and success metrics",
      category: 'business_value'
    }
  ],
  'follow-up': [
    {
      question: "What feedback have you received from the team since our last conversation?",
      focus: "Gathering stakeholder input and concerns",
      category: 'decision_process'
    },
    {
      question: "Are there any new requirements or considerations that have come up?",
      focus: "Identifying changing needs or scope",
      category: 'current_state'
    },
    {
      question: "What would you need to see to feel comfortable recommending this to leadership?",
      focus: "Building champion confidence and support",
      category: 'decision_process'
    },
    {
      question: "How are you thinking about budget and timeline for a project like this?",
      focus: "Qualifying budget and implementation timeline",
      category: 'business_value'
    },
    {
      question: "What's the best way to move this forward and keep momentum going?",
      focus: "Next steps and process advancement",
      category: 'decision_process'
    }
  ],
  contract: [
    {
      question: "Are there any specific terms or requirements that are particularly important to your organization?",
      focus: "Understanding contract and legal requirements",
      category: 'decision_process'
    },
    {
      question: "How does your procurement process typically work for solutions like this?",
      focus: "Navigating the purchasing and approval process",
      category: 'decision_process'
    },
    {
      question: "What would make implementation as smooth as possible for your team?",
      focus: "Implementation planning and success factors",
      category: 'current_state'
    },
    {
      question: "Are there any concerns from legal, security, or compliance teams we should address?",
      focus: "Risk mitigation and stakeholder buy-in",
      category: 'pain_point'
    },
    {
      question: "What does the ideal timeline look like from signing to going live?",
      focus: "Implementation planning and expectations",
      category: 'business_value'
    }
  ]
};

const industrySpecificQuestions: Record<string, DiscoveryQuestion[]> = {
  technology: [
    {
      question: "How does your current tech stack handle scalability and integration challenges?",
      focus: "Technical architecture and scalability needs",
      category: 'technical'
    },
    {
      question: "What development or deployment processes would this need to fit into?",
      focus: "Technical integration requirements",
      category: 'technical'
    }
  ],
  healthcare: [
    {
      question: "What compliance requirements (HIPAA, etc.) do we need to consider?",
      focus: "Regulatory compliance and data security",
      category: 'technical'
    },
    {
      question: "How does this fit into your patient care workflow?",
      focus: "Clinical workflow integration",
      category: 'current_state'
    }
  ],
  financial: [
    {
      question: "What regulatory or audit requirements impact your evaluation criteria?",
      focus: "Financial compliance and audit considerations",
      category: 'technical'
    },
    {
      question: "How do you measure ROI on operational improvements like this?",
      focus: "Financial justification and ROI measurement",
      category: 'business_value'
    }
  ],
  manufacturing: [
    {
      question: "How does this integrate with your existing production systems and processes?",
      focus: "Operational integration and workflow impact",
      category: 'technical'
    },
    {
      question: "What's the impact of downtime, and how do you plan for system changes?",
      focus: "Risk management and change planning",
      category: 'pain_point'
    }
  ]
};

export function getDiscoveryQuestions(
  meetingType: string, 
  industry?: string
): DiscoveryQuestion[] {
  const baseQuestions = discoveryQuestions[meetingType.toLowerCase()] || discoveryQuestions.discovery;
  const industryQuestions = industry ? industrySpecificQuestions[industry.toLowerCase()] || [] : [];
  
  return [...baseQuestions, ...industryQuestions];
}

export function getQuestionsByCategory(
  meetingType: string,
  category: DiscoveryQuestion['category'],
  industry?: string
): DiscoveryQuestion[] {
  const allQuestions = getDiscoveryQuestions(meetingType, industry);
  return allQuestions.filter(q => q.category === category);
}

export function getRandomQuestions(
  meetingType: string,
  count: number = 3,
  industry?: string
): DiscoveryQuestion[] {
  const allQuestions = getDiscoveryQuestions(meetingType, industry);
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
