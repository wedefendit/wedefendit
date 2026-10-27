export enum ContactTopicValue { General = "general", ComputerRepair = "computer_repair", VirusRemoval = "virus_removal", NetworkSecurity = "network_security", ScamProtection = "scam_protection", DataRecovery = "data_recovery", OnsiteSupport = "onsite_support", RemoteSupport = "remote_support", SmartHome = "smart_home", SigintPro = "sigint_pro", SigintEnterprise = "sigint_enterprise", SigintCommunity = "sigint_community", Other = "other" }
export type ContactTopic = `${ContactTopicValue}`;
export const CONTACT_LIMITS = { nameLength: 100, messageMin: 10, messageMax: 5000 };

type ContactTopicDefinition = Readonly<{ formLabel: string; messageLabel: string; recipient: string }>;

export const CONTACT_TOPICS: Record<ContactTopic, ContactTopicDefinition> = {
  [ContactTopicValue.General]: { formLabel: "General Question", messageLabel: "General Question", recipient: "contact@wedefendit.com" },
  [ContactTopicValue.ComputerRepair]: { formLabel: "Computer Repair", messageLabel: "Computer Repair", recipient: "service@wedefendit.com" },
  [ContactTopicValue.VirusRemoval]: { formLabel: "Virus and Malware Removal", messageLabel: "Virus and Malware Removal", recipient: "service@wedefendit.com" },
  [ContactTopicValue.NetworkSecurity]: { formLabel: "Home Network and Wi-Fi Security", messageLabel: "Home Network and Wi-Fi Security", recipient: "service@wedefendit.com" },
  [ContactTopicValue.ScamProtection]: { formLabel: "Scam and Fraud Protection", messageLabel: "Scam and Fraud Protection", recipient: "service@wedefendit.com" },
  [ContactTopicValue.DataRecovery]: { formLabel: "Data Recovery and Backup Help", messageLabel: "Data Recovery and Backup Help", recipient: "service@wedefendit.com" },
  [ContactTopicValue.OnsiteSupport]: { formLabel: "On-Site Tech Support", messageLabel: "On-Site Tech Support", recipient: "service@wedefendit.com" },
  [ContactTopicValue.RemoteSupport]: { formLabel: "Remote Support", messageLabel: "Remote Support", recipient: "service@wedefendit.com" },
  [ContactTopicValue.SmartHome]: { formLabel: "Smart Home Setup and Security", messageLabel: "Smart Home Setup and Security", recipient: "service@wedefendit.com" },
  [ContactTopicValue.SigintPro]: { formLabel: "SIGINT Pro", messageLabel: "SIGINT Pro Inquiry", recipient: "sigint-pro@wedefendit.com" },
  [ContactTopicValue.SigintEnterprise]: { formLabel: "SIGINT Enterprise", messageLabel: "SIGINT Enterprise Inquiry", recipient: "sigint-enterprise@wedefendit.com" },
  [ContactTopicValue.SigintCommunity]: { formLabel: "SIGINT Community Edition", messageLabel: "SIGINT Community Question", recipient: "sigint-community@wedefendit.com" },
  [ContactTopicValue.Other]: { formLabel: "Other", messageLabel: "Other", recipient: "contact@wedefendit.com" },
};

export function isContactTopic(value: string): value is ContactTopic {
  return Object.hasOwn(CONTACT_TOPICS, value);
}

export function contactTopicRecipient(value: string): string {
  return isContactTopic(value)
    ? CONTACT_TOPICS[value].recipient
    : CONTACT_TOPICS[ContactTopicValue.General].recipient;
}

export function contactTopicMessageLabel(value: string): string {
  return isContactTopic(value) ? CONTACT_TOPICS[value].messageLabel : value;
}

export function isValidContactEmail(value: string): boolean {
  const separator = value.indexOf("@");
  if (separator <= 0 || separator !== value.lastIndexOf("@")) return false;
  if (/\s/u.test(value)) return false;
  const domain = value.slice(separator + 1);
  const dot = domain.indexOf(".");
  return dot > 0 && dot < domain.length - 1;
}
