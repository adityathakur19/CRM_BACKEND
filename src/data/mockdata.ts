// ============================================
// MOCK DATA FOR TESTING
// ============================================
// Import this file to get sample data for testing your components and API calls

// LEADS DATA
// ============================================

export const SAMPLE_LEAD = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    source: "manual",
    status: "new",
    priority: "medium",
    company: "Acme Inc",
    jobTitle: "Manager",
    notes: "Interested in our premium plan",
    tags: ["hot", "enterprise"]
  };
  
  export const SAMPLE_LEADS = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      source: "manual",
      status: "new",
      priority: "high",
      company: "Acme Inc",
      jobTitle: "CEO",
      notes: "Very interested in enterprise plan",
      tags: ["hot", "enterprise"],
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      source: "facebook",
      status: "contacted",
      priority: "medium",
      company: "Tech Solutions",
      jobTitle: "Marketing Manager",
      notes: "Follow up next week",
      tags: ["warm", "smb"],
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      name: "Bob Wilson",
      email: "bob@startup.io",
      phone: "+1555123456",
      source: "google_ads",
      status: "qualified",
      priority: "urgent",
      company: "Startup Inc",
      jobTitle: "Founder",
      notes: "Ready to buy, needs demo",
      tags: ["hot", "startup", "callback"],
      createdAt: new Date().toISOString()
    }
  ];
  
  // FACEBOOK LEADS
  // ============================================
  
  export const SAMPLE_FACEBOOK_LEAD = {
    object: "page",
    entry: [{
      id: "123456789",
      time: Date.now(),
      changes: [{
        value: {
          form_id: "form_123456",
          leadgen_id: "lead_789012",
          created_time: Math.floor(Date.now() / 1000),
          field_data: [
            { name: "full_name", values: ["John Doe"] },
            { name: "email", values: ["john.doe@example.com"] },
            { name: "phone_number", values: ["+1234567890"] },
            { name: "city", values: ["New York"] },
            { name: "custom_question_1", values: ["Interested in Premium Plan"] }
          ],
          ad_id: "ad_456789",
          ad_name: "Summer Sale Campaign",
          adset_id: "adset_789",
          adset_name: "US Audience",
          campaign_id: "campaign_123",
          campaign_name: "Q3 Marketing",
        },
        field: "leadgen"
      }]
    }]
  };
  
  // INSTAGRAM LEADS
  // ============================================
  
  export const SAMPLE_INSTAGRAM_LEAD = {
    object: "instagram",
    entry: [{
      id: "instagram_123456",
      time: Date.now(),
      changes: [{
        value: {
          form_id: "ig_form_789",
          leadgen_id: "ig_lead_456",
          created_time: Math.floor(Date.now() / 1000),
          field_data: [
            { name: "full_name", values: ["Sarah Johnson"] },
            { name: "email", values: ["sarah.j@example.com"] },
            { name: "phone_number", values: ["+1555987654"] },
            { name: "question_1", values: ["Interested in influencer package"] }
          ],
          ad_id: "ig_ad_123",
          ad_name: "Instagram Story Ad"
        },
        field: "leadgen"
      }]
    }]
  };
  
  // GOOGLE ADS LEADS
  // ============================================
  
  export const SAMPLE_GOOGLE_ADS_LEAD = {
    google_key: "gclid_abc123xyz",
    lead_id: "google_lead_789",
    user_column_data: [
      { column_id: "FULL_NAME", string_value: "Michael Chen" },
      { column_id: "EMAIL", string_value: "michael.chen@example.com" },
      { column_id: "PHONE_NUMBER", string_value: "+1444555666" },
      { column_id: "COMPANY_NAME", string_value: "Digital Marketing Co" }
    ],
    campaign_id: "google_campaign_456",
    form_id: "google_form_123",
    timestamp: new Date().toISOString()
  };
  
  // WHATSAPP LEADS
  // ============================================
  
  export const SAMPLE_WHATSAPP_LEAD = {
    messaging_product: "whatsapp",
    contacts: [{
      profile: {
        name: "David Lee"
      },
      wa_id: "1234567890"
    }],
    messages: [{
      from: "1234567890",
      id: "wamid.123abc",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: "text",
      text: {
        body: "Hi, I'm interested in your services. Can you provide more information?"
      }
    }]
  };
  
  // LINKEDIN LEADS
  // ============================================
  
  export const SAMPLE_LINKEDIN_LEAD = {
    leadId: "linkedin_lead_123",
    campaignId: "linkedin_campaign_456",
    creativeId: "linkedin_creative_789",
    versionedLeadGenFormUrn: "urn:li:leadGenForm:123456",
    submittedAt: Date.now(),
    formResponse: {
      answers: [
        {
          questionId: "firstName",
          answerDetails: {
            textQuestionAnswer: {
              answer: "Emma"
            }
          }
        },
        {
          questionId: "lastName",
          answerDetails: {
            textQuestionAnswer: {
              answer: "Thompson"
            }
          }
        },
        {
          questionId: "email",
          answerDetails: {
            textQuestionAnswer: {
              answer: "emma.thompson@company.com"
            }
          }
        },
        {
          questionId: "phone",
          answerDetails: {
            textQuestionAnswer: {
              answer: "+1777888999"
            }
          }
        }
      ]
    }
  };
  
  // EMAIL LEADS
  // ============================================
  
  export const SAMPLE_EMAIL_LEAD = {
    formId: "email_form_123",
    submittedAt: new Date().toISOString(),
    fields: {
      name: "Alex Rodriguez",
      email: "alex.r@example.com",
      phone: "+1333222111",
      company: "Global Solutions Inc",
      message: "Looking for enterprise pricing information",
      source: "website_contact_form"
    }
  };
  
  // COMMUNICATIONS DATA
  // ============================================
  
  export const SAMPLE_WHATSAPP_MESSAGE = {
    leadId: "lead_123456",
    channel: "whatsapp",
    content: {
      text: "Hello! Thank you for your interest in our services. How can I help you today?"
    }
  };
  
  export const SAMPLE_EMAIL_MESSAGE = {
    leadId: "lead_123456",
    channel: "email",
    content: {
      subject: "Follow-up on your inquiry",
      body: "Dear Customer,\n\nThank you for reaching out to us. We wanted to follow up on your recent inquiry...",
      html: "<p>Dear Customer,</p><p>Thank you for reaching out...</p>"
    }
  };
  
  export const SAMPLE_SMS_MESSAGE = {
    leadId: "lead_123456",
    channel: "sms",
    content: {
      text: "Your appointment is confirmed for tomorrow at 2 PM. Reply YES to confirm or call to reschedule."
    }
  };
  
  export const SAMPLE_COMMUNICATIONS = [
    {
      id: "comm_1",
      leadId: "lead_123456",
      channel: "whatsapp",
      direction: "outbound",
      content: { text: "Hello! How can we help you?" },
      status: "delivered",
      timestamp: new Date().toISOString()
    },
    {
      id: "comm_2",
      leadId: "lead_123456",
      channel: "email",
      direction: "outbound",
      content: { 
        subject: "Welcome!", 
        body: "Thanks for signing up" 
      },
      status: "sent",
      timestamp: new Date().toISOString()
    },
    {
      id: "comm_3",
      leadId: "lead_789012",
      channel: "sms",
      direction: "inbound",
      content: { text: "Yes, I'm interested" },
      status: "received",
      timestamp: new Date().toISOString()
    }
  ];
  
  // WEBHOOK PAYLOADS
  // ============================================
  
  export const MOCK_WEBHOOKS = {
    facebook: SAMPLE_FACEBOOK_LEAD,
    instagram: SAMPLE_INSTAGRAM_LEAD,
    googleAds: SAMPLE_GOOGLE_ADS_LEAD,
    whatsapp: SAMPLE_WHATSAPP_LEAD,
    linkedin: SAMPLE_LINKEDIN_LEAD,
    email: SAMPLE_EMAIL_LEAD
  };
  
  // HELPER FUNCTIONS
  // ============================================
  
  export const generateRandomLead = () => {
    const names = ["John Doe", "Jane Smith", "Bob Wilson", "Alice Brown", "Charlie Davis"];
    const companies = ["Acme Inc", "Tech Solutions", "Startup Inc", "Global Corp", "Innovation Labs"];
    const sources = ["manual", "facebook", "google_ads", "linkedin", "instagram", "email"];
    const statuses = ["new", "contacted", "qualified", "lost"];
    const priorities = ["low", "medium", "high", "urgent"];
    
    return {
      name: names[Math.floor(Math.random() * names.length)],
      email: `${Math.random().toString(36).substring(7)}@example.com`,
      phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      jobTitle: "Manager",
      notes: "Auto-generated test lead",
      tags: ["test"],
      createdAt: new Date().toISOString()
    };
  };
  
  export const generateMultipleLeads = (count: number) => {
    return Array.from({ length: count }, () => generateRandomLead());
  };