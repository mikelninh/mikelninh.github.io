export const CONTROL_CATALOG = {
  mfa: {
    label: 'Phishing-resistant MFA',
    short: 'Stop a stolen password becoming a login.',
    why: 'Bind sensitive access to a second, phishing-resistant factor.'
  },
  leastPrivilege: {
    label: 'Least privilege',
    short: 'Limit what one identity can reach.',
    why: 'A compromised account should not automatically inherit broad data or admin access.'
  },
  segmentation: {
    label: 'Network / service segmentation',
    short: 'Stop one compromise spreading everywhere.',
    why: 'Separate critical services so lateral movement hits explicit boundaries.'
  },
  egress: {
    label: 'Egress & bulk-transfer controls',
    short: 'Make mass data extraction hard and visible.',
    why: 'Large or unusual outbound transfers should be limited, challenged or blocked.'
  },
  backups: {
    label: 'Immutable, restore-tested backups',
    short: 'Make destructive attacks recoverable.',
    why: 'Backups only count when attackers cannot rewrite them and teams can restore them.'
  },
  vendorIsolation: {
    label: 'Vendor isolation',
    short: 'Keep partner access narrow and revocable.',
    why: 'A supplier account should reach only the service and data it genuinely needs.'
  },
  detection: {
    label: 'Detection + rapid isolation',
    short: 'Shorten the time an attacker stays active.',
    why: 'High-risk behavior should trigger investigation, session isolation and containment.'
  },
  sessionRevocation: {
    label: 'Session / token revocation',
    short: 'Kill stolen sessions quickly.',
    why: 'Passwords can be changed while stolen sessions and OAuth tokens remain valid unless explicitly revoked.'
  }
}

export const TEMPLATES = [
  {
    id: 'city',
    label: 'City / public administration',
    shortLabel: 'City',
    description: 'Citizen services, document systems, staff identities and external providers.',
    scale: 1,
    assets: [
      ['Identity', '3,500 staff identities'],
      ['Critical service', 'Citizen service portal'],
      ['Internal service', 'Document & case management'],
      ['Sensitive data', 'Citizen and employee records'],
      ['External access', 'IT / software vendors'],
      ['Recovery', 'Central backup vault']
    ],
    defaults: {mfa:false, leastPrivilege:false, segmentation:false, egress:false, backups:true, vendorIsolation:false, detection:false, sessionRevocation:false}
  },
  {
    id: 'hospital',
    label: 'Hospital / care provider',
    shortLabel: 'Hospital',
    description: 'Clinical systems, staff accounts, connected vendors and time-critical services.',
    scale: .72,
    assets: [
      ['Identity', '1,200 clinical + admin accounts'],
      ['Critical service', 'Electronic health record'],
      ['Internal service', 'Scheduling & lab systems'],
      ['Sensitive data', 'Patient and workforce records'],
      ['External access', 'Medical / IT vendors'],
      ['Recovery', 'Clinical backup vault']
    ],
    defaults: {mfa:true, leastPrivilege:false, segmentation:true, egress:false, backups:true, vendorIsolation:false, detection:true, sessionRevocation:false}
  },
  {
    id: 'school',
    label: 'School / education network',
    shortLabel: 'School',
    description: 'Student records, learning tools, staff accounts and shared cloud services.',
    scale: .35,
    assets: [
      ['Identity', '450 staff + admin accounts'],
      ['Critical service', 'Student information system'],
      ['Internal service', 'Learning & collaboration suite'],
      ['Sensitive data', 'Student and family records'],
      ['External access', 'Education SaaS providers'],
      ['Recovery', 'Cloud + offline backups']
    ],
    defaults: {mfa:false, leastPrivilege:false, segmentation:false, egress:false, backups:true, vendorIsolation:false, detection:false, sessionRevocation:false}
  },
  {
    id: 'ngo',
    label: 'NGO / nonprofit',
    shortLabel: 'NGO',
    description: 'Donor CRM, communications, shared files, finance and third-party tools.',
    scale: .24,
    assets: [
      ['Identity', '120 staff + volunteer accounts'],
      ['Critical service', 'Donor / beneficiary CRM'],
      ['Internal service', 'Email & shared drive'],
      ['Sensitive data', 'Donor and beneficiary records'],
      ['External access', 'Fundraising / IT vendors'],
      ['Recovery', 'Cloud backup set']
    ],
    defaults: {mfa:true, leastPrivilege:false, segmentation:false, egress:false, backups:true, vendorIsolation:false, detection:false, sessionRevocation:false}
  },
  {
    id: 'business',
    label: 'Small business',
    shortLabel: 'Business',
    description: 'Email, CRM, accounting, storefront and cloud documents.',
    scale: .16,
    assets: [
      ['Identity', '40 staff accounts'],
      ['Critical service', 'Accounting / payments'],
      ['Internal service', 'CRM & email'],
      ['Sensitive data', 'Customer and finance records'],
      ['External access', 'Managed IT / SaaS'],
      ['Recovery', 'Cloud + local backup']
    ],
    defaults: {mfa:false, leastPrivilege:false, segmentation:false, egress:false, backups:true, vendorIsolation:false, detection:false, sessionRevocation:false}
  }
]

export const SCENARIOS = [
  {
    id: 'stolen-credentials',
    label: 'Stolen credentials',
    short: 'A staff password is stolen and used from an attacker-controlled device.',
    steps: [
      {title:'Use the stolen password', detail:'The attacker attempts to turn one stolen password into an authenticated session.', blockedBy:'mfa', impact:{identities:1, services:0, datasets:0, dataGB:0, downtimeHours:0}},
      {title:'Expand account privileges', detail:'The compromised identity attempts to reach data and functions beyond its normal job.', blockedBy:'leastPrivilege', impact:{identities:3, services:1, datasets:1, dataGB:3, downtimeHours:0}},
      {title:'Move to another service', detail:'The attacker uses the first foothold to reach a second internal service.', blockedBy:'segmentation', impact:{identities:2, services:2, datasets:1, dataGB:7, downtimeHours:1}},
      {title:'Stay active long enough to collect', detail:'Unusual access continues while the attacker gathers data and credentials.', blockedBy:'detection', impact:{identities:4, services:1, datasets:2, dataGB:22, downtimeHours:1}},
      {title:'Move collected data out', detail:'A sustained outbound transfer attempts to leave the organization.', blockedBy:'egress', impact:{identities:0, services:0, datasets:2, dataGB:140, downtimeHours:0}}
    ]
  },
  {
    id: 'ransomware',
    label: 'Ransomware on one device',
    short: 'Assume one workstation is compromised and destructive activity begins.',
    steps: [
      {title:'Compromise one endpoint', detail:'The scenario begins after one workstation is already compromised.', blockedBy:null, impact:{identities:1, services:0, datasets:0, dataGB:0, downtimeHours:1}},
      {title:'Spread to internal services', detail:'The attacker tries to use the endpoint as a bridge into shared systems.', blockedBy:'segmentation', impact:{identities:3, services:2, datasets:1, dataGB:2, downtimeHours:4}},
      {title:'Reach privileged operations', detail:'The attacker attempts to obtain rights needed to damage wider systems.', blockedBy:'leastPrivilege', impact:{identities:5, services:2, datasets:1, dataGB:3, downtimeHours:6}},
      {title:'Continue destructive behavior', detail:'Detection and isolation determine how long destructive activity remains active.', blockedBy:'detection', impact:{identities:0, services:2, datasets:2, dataGB:0, downtimeHours:12}},
      {title:'Destroy the recovery path', detail:'The attacker attempts to make restoration impossible by reaching backup copies.', blockedBy:'backups', impact:{identities:0, services:1, datasets:2, dataGB:0, downtimeHours:36}}
    ]
  },
  {
    id: 'vendor-compromise',
    label: 'Compromised vendor',
    short: 'A trusted supplier account or integration is taken over.',
    steps: [
      {title:'Use trusted vendor access', detail:'The attacker enters through an account or integration that the organization normally trusts.', blockedBy:'vendorIsolation', impact:{identities:1, services:1, datasets:0, dataGB:1, downtimeHours:0}},
      {title:'Reach broader privileges', detail:'The vendor foothold is used to access functions outside the contracted scope.', blockedBy:'leastPrivilege', impact:{identities:2, services:1, datasets:1, dataGB:5, downtimeHours:0}},
      {title:'Pivot to other services', detail:'The attacker tries to use the vendor connection to move laterally.', blockedBy:'segmentation', impact:{identities:2, services:2, datasets:1, dataGB:8, downtimeHours:2}},
      {title:'Remain active without rapid isolation', detail:'Anomalous vendor behavior continues until the connection is investigated and isolated.', blockedBy:'detection', impact:{identities:2, services:1, datasets:1, dataGB:12, downtimeHours:2}},
      {title:'Extract collected data', detail:'The attacker attempts to transfer collected information outside the organization.', blockedBy:'egress', impact:{identities:0, services:0, datasets:2, dataGB:90, downtimeHours:0}}
    ]
  },
  {
    id: 'bulk-exfiltration',
    label: 'Bulk data exfiltration',
    short: 'Assume a valid internal session starts reading far more information than normal.',
    steps: [
      {title:'Use a valid session', detail:'The scenario deliberately assumes authentication has already been bypassed or stolen.', blockedBy:null, impact:{identities:1, services:1, datasets:0, dataGB:1, downtimeHours:0}},
      {title:'Enumerate broad datasets', detail:'The session attempts to access records unrelated to the identity’s normal work.', blockedBy:'leastPrivilege', impact:{identities:0, services:1, datasets:3, dataGB:18, downtimeHours:0}},
      {title:'Collect at abnormal volume', detail:'The account reads and stages far more information than its normal behavior.', blockedBy:'detection', impact:{identities:0, services:1, datasets:2, dataGB:65, downtimeHours:0}},
      {title:'Transfer a large archive outward', detail:'A sustained outbound transfer attempts to cross the organization boundary.', blockedBy:'egress', impact:{identities:0, services:0, datasets:2, dataGB:420, downtimeHours:0}}
    ]
  },
  {
    id: 'oauth-token',
    label: 'Stolen SaaS / OAuth token',
    short: 'A cloud session token is stolen even though the password may already have been changed.',
    steps: [
      {title:'Reuse the stolen session', detail:'The attacker attempts to keep using an already-issued cloud session or OAuth token.', blockedBy:'sessionRevocation', impact:{identities:1, services:1, datasets:1, dataGB:2, downtimeHours:0}},
      {title:'Reach data beyond the intended task', detail:'The token is used against data or functions broader than necessary.', blockedBy:'leastPrivilege', impact:{identities:1, services:1, datasets:2, dataGB:14, downtimeHours:0}},
      {title:'Pivot through connected applications', detail:'The compromised cloud identity attempts to reach another connected service.', blockedBy:'vendorIsolation', impact:{identities:1, services:2, datasets:1, dataGB:7, downtimeHours:1}},
      {title:'Stay active without rapid response', detail:'Long-lived token activity continues until sessions and integrations are isolated.', blockedBy:'detection', impact:{identities:2, services:1, datasets:1, dataGB:20, downtimeHours:1}},
      {title:'Export cloud data', detail:'The attacker attempts a sustained transfer from the cloud environment.', blockedBy:'egress', impact:{identities:0, services:0, datasets:2, dataGB:110, downtimeHours:0}}
    ]
  }
]

export const RECOMMENDED_BASELINE = {
  mfa:true,
  leastPrivilege:true,
  segmentation:true,
  egress:true,
  backups:true,
  vendorIsolation:true,
  detection:true,
  sessionRevocation:true
}
