// GENERATED from the official MPRNT legal documents
// ("MPRNT – PRIVACY POLICY.docx" and "MPRNT-Terms.docx", effective 28 September 2026).
// Wording is copied verbatim; when the documents change, update this file to match them exactly.

export type LegalBlock =
  | { type: 'p'; text: string; strong?: boolean }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'lines'; lines: string[] };

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  meta: string[];
  sections: { heading: string; blocks: LegalBlock[] }[];
}

export const PRIVACY_POLICY: LegalDocument = {
  "title": "MPRNT – PRIVACY POLICY",
  "effectiveDate": "28 September 2026",
  "lastUpdated": "28 September 2026",
  "meta": [
    "Operated by: Mlock Innovations LLP",
    "Registered Office: 139, Uday Nagar, Indore Kanadia Road, Indore, Madhya Pradesh, India – 452016",
    "Product/Service: MPRNT – Smart Printing Platform"
  ],
  "sections": [
    {
      "heading": "1. Introduction",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT (“MPRNT”, “we”, “us”, or “our”), operated by Mlock Innovations LLP, respects the privacy of users who access or use our digital printing services."
        },
        {
          "type": "p",
          "text": "MPRNT provides a QR-based digital printing platform through which users can upload documents, select printing preferences, make payments, and submit print requests to participating print shops."
        },
        {
          "type": "p",
          "text": "This Privacy Policy explains what information may be collected or processed when you use MPRNT, how such information may be used, how it may be shared, and the measures we take to protect it."
        },
        {
          "type": "p",
          "text": "By accessing or using MPRNT, you acknowledge that you have read and understood this Privacy Policy."
        }
      ]
    },
    {
      "heading": "2. Scope of This Privacy Policy",
      "blocks": [
        {
          "type": "p",
          "text": "This Privacy Policy applies to information collected or processed when you:"
        },
        {
          "type": "ul",
          "items": [
            "Scan an MPRNT QR code;",
            "Access the MPRNT digital interface;",
            "Upload a document for printing;",
            "Select printing preferences;",
            "Place or manage a print order;",
            "Make or attempt to make a payment;",
            "Contact MPRNT support; or",
            "Otherwise interact with MPRNT services."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT does not require a User to provide their name, mobile number, or email address merely to use the basic QR-based printing service, unless such information is specifically required for a particular feature, support request, transaction, or applicable legal requirement.",
          "strong": true
        },
        {
          "type": "p",
          "text": "The physical printing service may be provided by an independent Partner Print Shop. Information required to fulfil a print order may therefore be shared with the relevant Partner Print Shop as described in this Privacy Policy.",
          "strong": true
        }
      ]
    },
    {
      "heading": "3. Information We May Collect",
      "blocks": [
        {
          "type": "p",
          "text": "Depending on how you use MPRNT, we may collect or process the following information:"
        },
        {
          "type": "h3",
          "text": "A. Uploaded Documents"
        },
        {
          "type": "p",
          "text": "To provide the printing service, MPRNT may temporarily process files uploaded by the User, such as:"
        },
        {
          "type": "ul",
          "items": [
            "PDF files;",
            "Images;",
            "Documents; and",
            "Other supported file formats."
          ]
        },
        {
          "type": "h3",
          "text": "B. Order Information"
        },
        {
          "type": "p",
          "text": "This may include:"
        },
        {
          "type": "ul",
          "items": [
            "Order/reference number;",
            "Selected Partner Print Shop;",
            "Printing preferences;",
            "Number of pages or copies;",
            "Order date and time;",
            "Order status; and",
            "Payment or transaction reference."
          ]
        },
        {
          "type": "h3",
          "text": "C. Payment Information"
        },
        {
          "type": "p",
          "text": "Payments may be processed through third-party payment service providers."
        },
        {
          "type": "p",
          "text": "MPRNT may receive limited transaction-related information, such as:"
        },
        {
          "type": "ul",
          "items": [
            "Payment status;",
            "Transaction/reference ID;",
            "Payment amount; and",
            "Payment confirmation."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT does not directly collect or store complete card numbers, UPI PINs, passwords, or banking credentials."
        },
        {
          "type": "h3",
          "text": "D. Technical Information"
        },
        {
          "type": "p",
          "text": "MPRNT may automatically process limited technical information necessary to operate and secure the service, such as:"
        },
        {
          "type": "ul",
          "items": [
            "IP address;",
            "Browser type;",
            "Device type;",
            "Operating system;",
            "Access time; and",
            "Technical logs."
          ]
        }
      ]
    },
    {
      "heading": "4. How We Use Your Information",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may use collected or processed information for purposes including:"
        },
        {
          "type": "ul",
          "items": [
            "Processing and fulfilling print orders;",
            "Sending uploaded documents to the relevant Partner Print Shop for printing;",
            "Processing and verifying payments;",
            "Generating and maintaining order records;",
            "Providing customer support when requested;",
            "Troubleshooting technical issues;",
            "Preventing fraud, misuse, and unauthorized activity;",
            "Maintaining platform security and system integrity;",
            "Improving the reliability and functionality of MPRNT;",
            "Complying with applicable legal and regulatory requirements; and",
            "Other purposes disclosed to the User at the time of collection or otherwise permitted by applicable law."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT will process information only for legitimate and relevant purposes connected with providing, securing, maintaining, or improving its services, or as otherwise permitted or required by applicable law."
        }
      ]
    },
    {
      "heading": "5. Sharing of Information",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may share or provide access to relevant information where reasonably necessary to provide the requested service."
        },
        {
          "type": "p",
          "text": "This may include sharing information with:"
        },
        {
          "type": "ul",
          "items": [
            "The relevant Partner Print Shop for fulfilling a print order;",
            "Payment gateway or payment service providers for processing transactions;",
            "Cloud hosting and technology service providers;",
            "Communication or notification service providers, where applicable;",
            "Technical and security service providers; and",
            "Government authorities, regulators, courts, or law-enforcement agencies where required by applicable law."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT does not sell User personal information to third parties for their independent marketing purposes."
        },
        {
          "type": "p",
          "text": "Uploaded documents may be made available to the relevant Partner Print Shop only to the extent reasonably necessary to process and fulfil the associated print order."
        },
        {
          "type": "p",
          "text": "Third-party service providers may process information in accordance with their own applicable terms, privacy policies, and legal obligations."
        },
        {
          "type": "p",
          "text": "MPRNT aims to limit information sharing to what is reasonably necessary for providing the requested service, maintaining the platform, protecting security, or complying with applicable law."
        }
      ]
    },
    {
      "heading": "6. Data and Document Deletion",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT follows a limited-retention approach for user data and uploaded documents."
        },
        {
          "type": "p",
          "text": "User-provided information and uploaded files are used only as reasonably necessary to process, complete, and support the printing service. Once the printing process is completed and the uploaded files are no longer required for service delivery, MPRNT may automatically delete or remove such files and temporary data from its active systems."
        },
        {
          "type": "p",
          "text": "This may include:"
        },
        {
          "type": "ul",
          "items": [
            "Uploaded documents and files;",
            "Temporary printing-session data;",
            "Temporary order-related user information;",
            "Temporary processing and upload data; and",
            "Other information that is no longer reasonably required for providing the service."
          ]
        },
        {
          "type": "p",
          "text": "Certain limited information, such as payment transaction references, transaction records, accounting records, security records, dispute-related information, or information required by law or regulatory authorities, may be retained for the period reasonably necessary for those purposes."
        },
        {
          "type": "p",
          "text": "MPRNT does not intend to retain uploaded documents longer than reasonably necessary for completing the printing service."
        },
        {
          "type": "p",
          "text": "The exact timing of deletion may depend on technical processing, backup, storage, and system-management processes."
        },
        {
          "type": "p",
          "text": "Users should avoid uploading highly sensitive or confidential documents unless they are necessary for the printing service."
        }
      ]
    },
    {
      "heading": "7. Data Security and Protection",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT takes reasonable technical and organizational measures to protect information processed through its platform."
        },
        {
          "type": "p",
          "text": "Depending on the nature of the information and service, these measures may include:"
        },
        {
          "type": "ul",
          "items": [
            "Secure data transmission;",
            "Access controls and authentication;",
            "Restricted access to operational systems;",
            "Technical monitoring and security measures;",
            "Protection against unauthorized access, misuse, or alteration; and",
            "Reasonable security practices for third-party service providers."
          ]
        },
        {
          "type": "p",
          "text": "Access to uploaded documents and order information is intended to be limited to persons or service providers who reasonably require such access for printing, technical operation, support, security, or other legitimate service-related purposes."
        },
        {
          "type": "p",
          "text": "However, no internet-based service, electronic transmission, storage system, or digital platform can be guaranteed to be completely secure. Users understand that they use the MPRNT platform at their own risk and should exercise appropriate caution when uploading documents."
        }
      ]
    },
    {
      "heading": "8. Access by Partner Print Shops",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT works with participating Partner Print Shops to provide physical printing services."
        },
        {
          "type": "p",
          "text": "When a user places a print order, the relevant Partner Print Shop may receive or access the uploaded document and order information necessary to fulfil that order."
        },
        {
          "type": "p",
          "text": "Such information may include:"
        },
        {
          "type": "ul",
          "items": [
            "Uploaded document(s);",
            "Number of copies;",
            "Page range;",
            "Colour or black-and-white selection;",
            "Paper size or type, where applicable;",
            "Order/reference information;",
            "Printing instructions; and",
            "Payment or order status where required for fulfilment."
          ]
        },
        {
          "type": "p",
          "text": "Partner Print Shops are independent businesses and may have their own operational practices and policies. MPRNT expects partners to handle user information responsibly and only for legitimate purposes connected with fulfilling the printing request."
        },
        {
          "type": "p",
          "text": "MPRNT does not authorize Partner Print Shops to use uploaded documents for unrelated purposes."
        }
      ]
    },
    {
      "heading": "9. Payment and Transaction Information",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may use third-party payment gateways or payment service providers to process payments."
        },
        {
          "type": "p",
          "text": "Depending on the payment method and provider, MPRNT may receive limited transaction information such as:"
        },
        {
          "type": "ul",
          "items": [
            "Transaction/reference ID;",
            "Payment status;",
            "Amount paid;",
            "Date and time of transaction; and",
            "Information necessary to identify or reconcile the transaction."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT does not intentionally request or store sensitive payment credentials such as:"
        },
        {
          "type": "ul",
          "items": [
            "UPI PIN;",
            "ATM/debit/credit card PIN;",
            "Banking passwords;",
            "Payment account passwords; or",
            "Complete card or banking credentials."
          ]
        },
        {
          "type": "p",
          "text": "Payment providers may process payment information according to their own privacy policies, security practices, and applicable laws."
        },
        {
          "type": "p",
          "text": "Users should review the applicable terms and privacy policies of the payment provider used for a transaction where necessary."
        }
      ]
    },
    {
      "heading": "10. Cookies and Similar Technologies",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may use cookies, local storage, session technologies, or similar technical mechanisms to operate and improve the platform."
        },
        {
          "type": "p",
          "text": "These technologies may be used for purposes such as:"
        },
        {
          "type": "ul",
          "items": [
            "Maintaining a temporary user session;",
            "Supporting document upload and printing functionality;",
            "Remembering temporary order or printing preferences;",
            "Maintaining platform security;",
            "Detecting technical issues or misuse;",
            "Improving system performance and reliability; and",
            "Understanding basic technical usage of the platform."
          ]
        },
        {
          "type": "p",
          "text": "Some technologies may be necessary for the basic operation of the MPRNT service and may not be optional."
        },
        {
          "type": "p",
          "text": "MPRNT does not use cookies or similar technologies with the intention of collecting unnecessary personal information merely for basic QR-based printing."
        },
        {
          "type": "p",
          "text": "Users may be able to control certain cookies or browser storage settings through their device or browser. Disabling necessary technologies may affect the functionality or availability of some MPRNT features."
        }
      ]
    },
    {
      "heading": "11. Legal and Necessary Data Retention",
      "blocks": [
        {
          "type": "p",
          "text": "Although MPRNT generally deletes uploaded documents and temporary user data after the printing service is completed, certain limited information may need to be retained for legitimate purposes."
        },
        {
          "type": "p",
          "text": "This may include:"
        },
        {
          "type": "ul",
          "items": [
            "Payment and transaction records;",
            "Accounting and financial records;",
            "Order/reference information;",
            "Records required for resolving disputes;",
            "Security and fraud-prevention records;",
            "Information required by applicable laws or regulations; and",
            "Records necessary to establish, exercise, or defend legal rights."
          ]
        },
        {
          "type": "p",
          "text": "Such information will be retained only for as long as reasonably necessary for the relevant purpose or as required by applicable law."
        },
        {
          "type": "p",
          "text": "MPRNT does not intend to retain uploaded printing documents when they are no longer required for completing or supporting the printing service."
        }
      ]
    },
    {
      "heading": "12. User Rights and Choices",
      "blocks": [
        {
          "type": "p",
          "text": "Depending on applicable law and the nature of the information processed, users may have certain rights regarding their information."
        },
        {
          "type": "p",
          "text": "These may include the ability to:"
        },
        {
          "type": "ul",
          "items": [
            "Request information about data processed by MPRNT;",
            "Request correction of inaccurate information;",
            "Request deletion of information where applicable;",
            "Raise concerns regarding the handling of personal information;",
            "Withdraw consent where processing is based on consent and withdrawal is legally applicable; and",
            "Request clarification regarding the use of their information."
          ]
        },
        {
          "type": "p",
          "text": "Because basic MPRNT printing can be accessed through a QR-based interface without requiring a name, mobile number, or email address, MPRNT may not always be able to identify a particular user or locate information without sufficient order, transaction, or technical details."
        },
        {
          "type": "p",
          "text": "To make a privacy-related request, users may contact MPRNT using the contact details provided in this Privacy Policy. MPRNT may request reasonable information necessary to verify and process the request."
        },
        {
          "type": "p",
          "text": "Some requests may be subject to legal, security, technical, or operational limitations."
        }
      ]
    },
    {
      "heading": "13. Children's Privacy",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT is a general-purpose printing platform and is not specifically designed to collect personal information from children."
        },
        {
          "type": "p",
          "text": "MPRNT does not intentionally require children to provide personal information merely to use the basic QR-based printing service."
        },
        {
          "type": "p",
          "text": "Where the use of the service involves a child or minor, the person responsible for the child should ensure that the service is used appropriately and lawfully."
        },
        {
          "type": "p",
          "text": "If MPRNT becomes aware that personal information has been collected from a child in circumstances where such collection was not appropriate or legally permitted, MPRNT may take reasonable steps to delete or remove such information, subject to applicable law."
        }
      ]
    },
    {
      "heading": "14. Third-Party Services and Links",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may use or interact with third-party services to operate its platform and provide printing services."
        },
        {
          "type": "p",
          "text": "These may include:"
        },
        {
          "type": "ul",
          "items": [
            "Payment service providers;",
            "Cloud hosting and storage providers;",
            "Technical infrastructure providers;",
            "Security and monitoring services;",
            "Communication or notification services;",
            "Analytics or performance services; and",
            "Partner Print Shops."
          ]
        },
        {
          "type": "p",
          "text": "Third-party services may have their own terms, privacy policies, security practices, and data-handling procedures."
        },
        {
          "type": "p",
          "text": "MPRNT is not responsible for the independent privacy practices of third parties where they operate separately from MPRNT."
        },
        {
          "type": "p",
          "text": "Where MPRNT provides links or references to external websites or services, users should review the applicable privacy policies and terms of those third parties before using them."
        }
      ]
    },
    {
      "heading": "15. Data Storage and Transfers",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may use third-party technology, cloud infrastructure, hosting services, and other technical providers to operate its platform and process information."
        },
        {
          "type": "p",
          "text": "Depending on the service provider and technical architecture, information may be processed or stored on systems located in India or other jurisdictions."
        },
        {
          "type": "p",
          "text": "Where information is processed through third-party infrastructure, MPRNT will take reasonable steps to use appropriate service providers and security measures for the relevant purpose."
        },
        {
          "type": "p",
          "text": "Uploaded documents are intended to be processed only for purposes connected with providing the printing service and are deleted or removed after printing when they are no longer required, subject to the limited retention described in this Privacy Policy."
        },
        {
          "type": "p",
          "text": "By using MPRNT, users acknowledge that digital information may be technically processed through infrastructure operated by MPRNT or its service providers, subject to applicable laws and this Privacy Policy."
        }
      ]
    },
    {
      "heading": "16. Lawful Processing and Consent",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT processes information only for purposes reasonably connected with providing, operating, securing, and improving its services, or where processing is otherwise permitted or required under applicable law."
        },
        {
          "type": "p",
          "text": "Depending on the circumstances, processing may be based on:"
        },
        {
          "type": "ul",
          "items": [
            "The user's request to use the MPRNT printing service;",
            "The need to process information to fulfil a print order;",
            "User consent, where required;",
            "Legitimate operational, security, or service-related purposes where legally permitted; or",
            "Legal, regulatory, or governmental requirements."
          ]
        },
        {
          "type": "p",
          "text": "Where consent is required by applicable law, MPRNT will seek such consent through an appropriate mechanism."
        },
        {
          "type": "p",
          "text": "Users may choose not to provide information that is not necessary for the basic printing service. However, refusing information that is technically or legally necessary may prevent MPRNT from providing a particular service or completing an order."
        }
      ]
    },
    {
      "heading": "17. Data Related to Customer Support and Complaints",
      "blocks": [
        {
          "type": "p",
          "text": "If a user contacts MPRNT for support, complaint resolution, refund assistance, technical assistance, or other service-related communication, MPRNT may process the information provided during that interaction."
        },
        {
          "type": "p",
          "text": "This may include:"
        },
        {
          "type": "ul",
          "items": [
            "Order or transaction reference;",
            "Description of the issue;",
            "Payment-related information necessary to investigate the issue;",
            "Screenshots or other supporting information;",
            "Communication records; and",
            "Technical information relevant to troubleshooting."
          ]
        },
        {
          "type": "p",
          "text": "Such information may be used to investigate and resolve the user's request, improve customer support, prevent misuse, and maintain appropriate business or legal records."
        },
        {
          "type": "p",
          "text": "MPRNT may retain support-related information for a reasonable period where necessary to resolve the issue or maintain records required for legitimate business, security, or legal purposes."
        }
      ]
    },
    {
      "heading": "18. Security Incidents and Data Breaches",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT takes reasonable measures to protect information from unauthorized access, misuse, loss, alteration, or disclosure."
        },
        {
          "type": "p",
          "text": "If MPRNT becomes aware of a security incident affecting information processed through its systems, it may take reasonable steps to:"
        },
        {
          "type": "ul",
          "items": [
            "Investigate the incident;",
            "Secure or restrict affected systems;",
            "Identify and address the cause;",
            "Take steps to prevent further unauthorized access;",
            "Preserve relevant evidence where necessary; and",
            "Provide notifications or take other actions where required by applicable law."
          ]
        },
        {
          "type": "p",
          "text": "Because no digital system can be guaranteed to be completely secure, users acknowledge that security risks associated with internet-based services cannot be completely eliminated."
        }
      ]
    },
    {
      "heading": "19. Business Transfers and Organizational Changes",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT is operated by Mlock Innovations LLP."
        },
        {
          "type": "p",
          "text": "If MPRNT or any part of its business is involved in a merger, restructuring, acquisition, investment, transfer of business, sale of assets, or similar organizational transaction, certain business and service-related information may be transferred as part of that transaction, subject to applicable law."
        },
        {
          "type": "p",
          "text": "Any such transfer will be handled in accordance with applicable legal requirements and appropriate contractual or organizational safeguards where reasonably applicable."
        },
        {
          "type": "p",
          "text": "The use of information following such a transaction will remain subject to applicable privacy obligations and, where appropriate, an updated privacy policy."
        }
      ]
    },
    {
      "heading": "20. Changes to This Privacy Policy",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may update or modify this Privacy Policy from time to time to reflect changes in:"
        },
        {
          "type": "ul",
          "items": [
            "MPRNT services or technology;",
            "Data-processing practices;",
            "Partner or service-provider arrangements;",
            "Applicable laws or regulations;",
            "Security requirements; or",
            "Business and operational processes."
          ]
        },
        {
          "type": "p",
          "text": "When changes are made, MPRNT may update the effective date shown at the beginning of this Privacy Policy and may provide additional notice where reasonably appropriate."
        },
        {
          "type": "p",
          "text": "Users are encouraged to review this Privacy Policy periodically."
        },
        {
          "type": "p",
          "text": "Continued use of the MPRNT platform after an updated Privacy Policy becomes effective may constitute acknowledgment of the updated policy to the extent permitted by applicable law."
        }
      ]
    },
    {
      "heading": "21. Grievance and Privacy-Related Complaints",
      "blocks": [
        {
          "type": "p",
          "text": "If a user has any concern, complaint, or request regarding the collection, use, processing, security, or deletion of information, they may contact MPRNT using the contact details provided in this Privacy Policy."
        },
        {
          "type": "p",
          "text": "To help MPRNT investigate and respond efficiently, users should provide relevant information such as:"
        },
        {
          "type": "ul",
          "items": [
            "Order or transaction reference, where available;",
            "Date and approximate time of the interaction;",
            "Description of the privacy concern or request;",
            "Relevant screenshots or supporting information, where applicable; and",
            "Contact information where a response is required."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT may request additional information where reasonably necessary to verify the request or investigate the matter."
        },
        {
          "type": "p",
          "text": "MPRNT will review privacy-related concerns and take reasonable steps to address them in accordance with applicable law and its internal processes."
        }
      ]
    },
    {
      "heading": "22. Accuracy of Information Provided by Users",
      "blocks": [
        {
          "type": "p",
          "text": "Users are responsible for ensuring that any information they voluntarily provide to MPRNT is accurate, complete, and relevant to the purpose for which it is provided."
        },
        {
          "type": "p",
          "text": "MPRNT does not require a user's name, mobile number, or email address for basic QR-based printing unless such information becomes necessary for a particular feature, support request, transaction, or legal requirement."
        },
        {
          "type": "p",
          "text": "If a user voluntarily provides information to MPRNT, the user should provide accurate information and should not knowingly provide information belonging to another person without appropriate authorization."
        },
        {
          "type": "p",
          "text": "MPRNT may rely on the information provided by users when processing support requests, orders, refunds, or other service-related matters."
        }
      ]
    },
    {
      "heading": "23. Confidentiality of Uploaded Documents",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT understands that documents submitted for printing may contain personal, academic, professional, financial, or other private information."
        },
        {
          "type": "p",
          "text": "Uploaded documents are processed primarily for fulfilling the requested printing service."
        },
        {
          "type": "p",
          "text": "MPRNT does not claim ownership of a user's uploaded documents merely because the documents are submitted through the platform."
        },
        {
          "type": "p",
          "text": "However, users are responsible for ensuring that they have the necessary rights or permission to upload and reproduce the documents."
        },
        {
          "type": "p",
          "text": "Users should avoid uploading documents containing extremely sensitive or confidential information unless printing such documents through the service is necessary and appropriate for them."
        },
        {
          "type": "p",
          "text": "Where documents are transmitted to a Partner Print Shop for fulfilment, the relevant partner may access the document solely as reasonably necessary to complete the printing request."
        }
      ]
    },
    {
      "heading": "24. Information Relating to Fraud, Misuse, and Security",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may process limited information where reasonably necessary to detect, prevent, investigate, or respond to:"
        },
        {
          "type": "ul",
          "items": [
            "Fraudulent transactions;",
            "Unauthorized use of the platform;",
            "Abuse or misuse of the printing service;",
            "Malicious files or technical attacks;",
            "Attempts to interfere with platform operations;",
            "Payment-related irregularities;",
            "Security incidents; or",
            "Activities that may violate applicable laws or MPRNT's Terms & Conditions."
          ]
        },
        {
          "type": "p",
          "text": "Such information may include technical logs, transaction references, order information, device-related information, or other information relevant to investigating the issue."
        },
        {
          "type": "p",
          "text": "MPRNT may restrict, suspend, or take other appropriate action against activity that presents a reasonable security, fraud, legal, or operational risk, subject to applicable law."
        }
      ]
    },
    {
      "heading": "25. Contact Information",
      "blocks": [
        {
          "type": "p",
          "text": "For privacy-related questions, requests, complaints, or concerns, users may contact MPRNT using the following details:"
        },
        {
          "type": "lines",
          "lines": [
            "MPRNT – Smart Printing Platform",
            "Operated by: Mlock Innovations LLP",
            "Registered Office: 139, Uday Nagar, Indore Kanadia Road, Indore, Madhya Pradesh, India – 452016",
            "Email: mprntindore@gmail.com",
            "Customer Support: +91 89894 94417"
          ]
        },
        {
          "type": "p",
          "text": "When contacting MPRNT regarding a specific order or privacy request, users should provide sufficient information to help identify and address the matter."
        },
        {
          "type": "p",
          "text": "MPRNT may request reasonable verification or additional information before processing certain requests, particularly where the request involves access to, correction of, or deletion of information."
        }
      ]
    },
    {
      "heading": "26. User Responsibility for Third-Party Information",
      "blocks": [
        {
          "type": "p",
          "text": "Users should not upload or submit personal, confidential, or sensitive information belonging to another person unless they have the necessary permission or legal authority to do so."
        },
        {
          "type": "p",
          "text": "If a user submits a document containing information about another individual, the user is responsible for ensuring that such submission and printing is lawful and authorized."
        },
        {
          "type": "p",
          "text": "MPRNT does not independently verify the ownership, authorization, or legal status of every document uploaded through the platform."
        },
        {
          "type": "p",
          "text": "Any dispute arising from unauthorized submission of another person's information may be addressed in accordance with applicable law and MPRNT's Terms & Conditions."
        }
      ]
    },
    {
      "heading": "27. No Sale of Personal Information",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT does not sell users' personal information to third parties for independent commercial purposes."
        },
        {
          "type": "p",
          "text": "Information may, however, be shared with service providers, Partner Print Shops, payment providers, technology providers, or other parties where reasonably necessary to operate the MPRNT service, process orders, provide support, maintain security, comply with legal requirements, or perform other purposes described in this Privacy Policy."
        },
        {
          "type": "p",
          "text": "Uploaded documents are not intended to be sold or commercially exploited by MPRNT."
        }
      ]
    },
    {
      "heading": "28. Limitation Regarding External Services",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may depend on external services and infrastructure for certain functions, including payment processing, hosting, cloud infrastructure, security, communication, analytics, and technical operations."
        },
        {
          "type": "p",
          "text": "MPRNT does not control every aspect of these third-party services."
        },
        {
          "type": "p",
          "text": "If a third-party service experiences downtime, security issues, technical failures, changes in policy, or other problems, certain MPRNT functionality may be affected."
        },
        {
          "type": "p",
          "text": "Where appropriate, users should review the privacy policies and terms of the relevant third-party service providers."
        }
      ]
    },
    {
      "heading": "29. Applicable Law",
      "blocks": [
        {
          "type": "p",
          "text": "This Privacy Policy is intended to be interpreted in accordance with the applicable laws and regulations of India."
        },
        {
          "type": "p",
          "text": "The processing of information through MPRNT will be subject to applicable privacy, data protection, consumer protection, technology, payment, and other relevant legal requirements."
        },
        {
          "type": "p",
          "text": "Nothing in this Privacy Policy is intended to remove or restrict any rights that users may have under applicable law."
        },
        {
          "type": "p",
          "text": "Where a provision of this Privacy Policy conflicts with a mandatory legal requirement, the applicable legal requirement will prevail to the extent of the conflict."
        }
      ]
    },
    {
      "heading": "30. Final Acknowledgment",
      "blocks": [
        {
          "type": "p",
          "text": "By accessing or using MPRNT, scanning an MPRNT QR code, uploading a document, placing a print request, making a payment, or otherwise using the platform, the user acknowledges that they have had an opportunity to review this Privacy Policy."
        },
        {
          "type": "p",
          "text": "This Privacy Policy explains how MPRNT may collect, use, process, share, protect, and delete information in connection with its services."
        },
        {
          "type": "p",
          "text": "MPRNT's approach is to process information only as reasonably necessary for providing and operating the service, while uploaded documents and temporary user data are deleted or removed after printing when they are no longer required, subject to limited retention for legal, payment, security, accounting, dispute, or other legitimate purposes described in this Privacy Policy."
        },
        {
          "type": "p",
          "text": "For questions or concerns regarding this Privacy Policy, users may contact MPRNT at:"
        },
        {
          "type": "lines",
          "lines": [
            "MPRNT – Smart Printing Platform",
            "Operated by: Mlock Innovations LLP",
            "Email: mprntindore@gmail.com",
            "Customer Support: +91 89894 94417",
            "Registered Office: 139, Uday Nagar, Indore Kanadia Road, Indore, Madhya Pradesh, India – 452016"
          ]
        }
      ]
    }
  ]
};

export const TERMS: LegalDocument = {
  "title": "MPRNT – TERMS & CONDITIONS",
  "effectiveDate": "28 September 2026",
  "lastUpdated": "28 September 2026",
  "meta": [
    "Operated by: Mlock Innovations LLP",
    "Registered Office: 139, Uday Nagar, Indore Kanadia Road, Indore, Madhya Pradesh, India – 452016",
    "Product/Service: MPRNT – Smart Printing Platform"
  ],
  "sections": [
    {
      "heading": "1. Introduction",
      "blocks": [
        {
          "type": "p",
          "text": "Welcome to MPRNT, a digital printing platform operated by Mlock Innovations LLP (“MPRNT”, “we”, “us”, or “our”), having its registered office at 139, Uday Nagar, Indore Kanadia Road, Indore, Madhya Pradesh, India – 452016."
        },
        {
          "type": "p",
          "text": "MPRNT enables users to submit documents digitally through a QR-based interface and place printing requests at participating print shops. The actual physical printing service may be performed by an independent participating print shop (“Partner Print Shop”)."
        },
        {
          "type": "p",
          "text": "By accessing or using MPRNT, you acknowledge that you have read, understood, and agreed to these Terms & Conditions."
        }
      ]
    },
    {
      "heading": "2. Definitions",
      "blocks": [
        {
          "type": "p",
          "text": "For the purpose of these Terms:"
        },
        {
          "type": "ul",
          "items": [
            "“MPRNT” means the digital printing platform and related services provided by Mlock Innovations LLP.",
            "“User” / “you” means any person accessing or using MPRNT services.",
            "“Partner Print Shop” means a third-party print shop participating in the MPRNT network and fulfilling printing requests.",
            "“Print Order” means a request submitted by a User for printing one or more documents.",
            "“Document” means any file uploaded by the User for printing through MPRNT.",
            "“Platform” means the MPRNT digital interface, QR-based webpage, systems, software, and related technology."
          ]
        }
      ]
    },
    {
      "heading": "3. Acceptance of Terms",
      "blocks": [
        {
          "type": "p",
          "text": "By scanning an MPRNT QR code, accessing the MPRNT platform, uploading a document, placing a print order, or making a payment through MPRNT, you agree to be bound by these Terms & Conditions."
        },
        {
          "type": "p",
          "text": "If you do not agree with these Terms, you should not use the MPRNT service."
        },
        {
          "type": "p",
          "text": "MPRNT may update these Terms from time to time. Continued use of the service after an update constitutes acceptance of the revised Terms."
        }
      ]
    },
    {
      "heading": "4. Nature of MPRNT Service",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT provides a technology-enabled system that allows Users to:"
        },
        {
          "type": "ul",
          "items": [
            "Scan an MPRNT QR code;",
            "Upload documents through the digital interface;",
            "Select available printing preferences;",
            "Review and place a print request;",
            "Make the applicable payment; and",
            "Collect the printed documents from the relevant Partner Print Shop."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT primarily facilitates the digital ordering and coordination of printing services. The physical printing may be performed by the respective Partner Print Shop using its own printing equipment."
        }
      ]
    },
    {
      "heading": "5. Partner Print Shops",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may work with independent Partner Print Shops to fulfil User print orders."
        },
        {
          "type": "p",
          "text": "The Partner Print Shop may be responsible for:"
        },
        {
          "type": "ul",
          "items": [
            "Receiving the print request;",
            "Processing and printing the submitted document;",
            "Maintaining the required printing equipment;",
            "Preparing the printed copies; and",
            "Providing the printed documents to the User."
          ]
        },
        {
          "type": "p",
          "text": "Partner Print Shops may operate independently and may have their own operating hours, equipment capabilities, paper availability, and service limitations."
        },
        {
          "type": "p",
          "text": "MPRNT may assist in coordinating the printing process but does not necessarily own or operate the physical printing equipment used by every Partner Print Shop."
        }
      ]
    },
    {
      "heading": "6. User Eligibility",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT services may be used by individuals who are legally capable of entering into a binding agreement under applicable law."
        },
        {
          "type": "p",
          "text": "By using MPRNT, you confirm that the information provided by you is accurate and that you are using the service for lawful purposes."
        },
        {
          "type": "p",
          "text": "If a User is a minor, the service should be used with the knowledge and supervision of a parent or legal guardian where required by applicable law."
        }
      ]
    },
    {
      "heading": "7. QR-Based Printing Process",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT uses a QR-based system to initiate the printing process."
        },
        {
          "type": "p",
          "text": "The general process may include:"
        },
        {
          "type": "ul",
          "items": [
            "Scanning the MPRNT QR code;",
            "Opening the MPRNT digital interface;",
            "Uploading the required document;",
            "Selecting available print options;",
            "Reviewing the print order;",
            "Making the applicable payment;",
            "Processing the print request through the Partner Print Shop; and",
            "Collecting the printed document."
          ]
        },
        {
          "type": "p",
          "text": "The exact options and process may vary depending on the Partner Print Shop, printer capabilities, availability, and technical conditions."
        }
      ]
    },
    {
      "heading": "8. Document Upload",
      "blocks": [
        {
          "type": "p",
          "text": "Users are responsible for ensuring that the documents uploaded through MPRNT are:"
        },
        {
          "type": "ul",
          "items": [
            "Correct and complete;",
            "In a supported file format;",
            "Suitable for printing;",
            "Legally permissible to print; and",
            "Free from malicious software or content intended to disrupt the platform."
          ]
        },
        {
          "type": "p",
          "text": "The User should review the document and selected print settings before confirming the order."
        },
        {
          "type": "p",
          "text": "MPRNT may reject or discontinue processing of a document where there is a reasonable concern regarding technical issues, unlawful content, security risks, or violation of these Terms."
        }
      ]
    },
    {
      "heading": "9. Print Settings",
      "blocks": [
        {
          "type": "p",
          "text": "Depending on the Partner Print Shop and available equipment, MPRNT may provide options such as:"
        },
        {
          "type": "ul",
          "items": [
            "Number of copies;",
            "Page selection or page range;",
            "Colour or black-and-white printing;",
            "Single-sided or double-sided printing;",
            "Paper size; and",
            "Other printing preferences."
          ]
        },
        {
          "type": "p",
          "text": "Available options may differ between Partner Print Shops."
        },
        {
          "type": "p",
          "text": "The User is responsible for selecting the correct print settings before placing the order. Once an order has been processed or printing has started, changes may not be possible."
        }
      ]
    },
    {
      "heading": "10. Pricing and Payment",
      "blocks": [
        {
          "type": "p",
          "text": "The applicable printing charges will be displayed to the User before the order is confirmed, wherever technically possible."
        },
        {
          "type": "p",
          "text": "The total amount may depend on factors including:"
        },
        {
          "type": "ul",
          "items": [
            "Number of pages;",
            "Number of copies;",
            "Colour or black-and-white printing;",
            "Paper size;",
            "Printing type; and",
            "Other applicable service charges."
          ]
        },
        {
          "type": "p",
          "text": "Payments may be processed through third-party payment service providers. MPRNT may not directly store complete card, UPI, banking, or other sensitive payment credentials."
        },
        {
          "type": "p",
          "text": "The User is responsible for completing payment using a valid and authorized payment method."
        },
        {
          "type": "p",
          "text": "An order may not be processed until the required payment is successfully confirmed."
        }
      ]
    },
    {
      "heading": "11. Order Confirmation",
      "blocks": [
        {
          "type": "p",
          "text": "After successfully placing a print order, the User may receive an order confirmation through the MPRNT interface or other available communication method."
        },
        {
          "type": "p",
          "text": "The confirmation may include information such as:"
        },
        {
          "type": "ul",
          "items": [
            "Order/reference number;",
            "Selected print settings;",
            "Number of pages or copies;",
            "Applicable charges;",
            "Selected Partner Print Shop; and",
            "Order status."
          ]
        },
        {
          "type": "p",
          "text": "The User should verify the order details before proceeding to collect the printed documents."
        }
      ]
    },
    {
      "heading": "12. Printing and Order Processing",
      "blocks": [
        {
          "type": "p",
          "text": "Once an order is successfully confirmed and payment is received, the print request may be transmitted to the relevant Partner Print Shop for processing."
        },
        {
          "type": "p",
          "text": "Printing time may vary depending on:"
        },
        {
          "type": "ul",
          "items": [
            "Number of pages;",
            "Number of copies;",
            "Printer availability;",
            "Internet or system connectivity;",
            "Existing orders at the Partner Print Shop;",
            "Paper or ink availability; and",
            "Other operational circumstances."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT does not guarantee a specific printing time unless an estimated or guaranteed time has been expressly communicated to the User."
        }
      ]
    },
    {
      "heading": "13. Collection of Printed Documents",
      "blocks": [
        {
          "type": "p",
          "text": "The User is responsible for collecting the printed documents from the designated Partner Print Shop."
        },
        {
          "type": "p",
          "text": "The User may be required to provide an order/reference number or other information to identify the order."
        },
        {
          "type": "p",
          "text": "Users should verify the number of copies and general printing quality before leaving the Partner Print Shop."
        },
        {
          "type": "p",
          "text": "MPRNT or the Partner Print Shop may not be responsible for documents that are not collected within the applicable operating period or as otherwise communicated to the User."
        }
      ]
    },
    {
      "heading": "14. Cancellation of Orders",
      "blocks": [
        {
          "type": "p",
          "text": "A User may request cancellation of a print order only where cancellation is technically and operationally possible."
        },
        {
          "type": "p",
          "text": "Once printing has started, cancellation may not be possible."
        },
        {
          "type": "p",
          "text": "If an order is cancelled before printing begins, the User may be eligible for a refund depending on the applicable circumstances and refund policy."
        },
        {
          "type": "p",
          "text": "Any applicable refund will be processed through the relevant payment method or payment service provider, subject to applicable processing timelines."
        }
      ]
    },
    {
      "heading": "15. Refunds",
      "blocks": [
        {
          "type": "p",
          "text": "Refunds may be considered in circumstances such as:"
        },
        {
          "type": "ul",
          "items": [
            "Payment being successfully deducted but the order not being created;",
            "Duplicate payment for the same order;",
            "Printing being unsuccessful due to a technical issue attributable to the MPRNT system or Partner Print Shop;",
            "An order being cancelled before printing where a refund is applicable; or",
            "Other circumstances determined by MPRNT under the applicable refund policy."
          ]
        },
        {
          "type": "p",
          "text": "Refund eligibility may depend on the nature of the issue and whether printing has already been completed."
        },
        {
          "type": "p",
          "text": "Users may be required to provide their order/reference number and relevant payment details when raising a refund request."
        },
        {
          "type": "p",
          "text": "Refunds, where approved, may take additional time to reflect depending on the payment provider or financial institution."
        }
      ]
    },
    {
      "heading": "16. Failed, Incorrect, or Poor-Quality Printing",
      "blocks": [
        {
          "type": "p",
          "text": "If a print order is not completed correctly, the User should report the issue to the Partner Print Shop or through the available MPRNT support channel as soon as reasonably possible."
        },
        {
          "type": "p",
          "text": "Issues may include:"
        },
        {
          "type": "ul",
          "items": [
            "Missing pages;",
            "Incorrect number of copies;",
            "Blank or incomplete pages;",
            "Printing in an incorrect colour mode;",
            "Incorrect paper size;",
            "Significant printing defects; or",
            "Printing failure due to technical problems."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT may review the order details and circumstances before determining whether a reprint, partial refund, or other resolution is applicable."
        },
        {
          "type": "p",
          "text": "Minor differences in colour, paper appearance, or print quality caused by printer capabilities, paper quality, or normal printing variations may not qualify as a printing defect."
        }
      ]
    },
    {
      "heading": "17. User Responsibilities",
      "blocks": [
        {
          "type": "p",
          "text": "The User is responsible for:"
        },
        {
          "type": "ul",
          "items": [
            "Uploading the correct document;",
            "Selecting the correct printing preferences;",
            "Providing accurate order information;",
            "Making the required payment;",
            "Collecting the printed documents;",
            "Using MPRNT only for lawful purposes; and",
            "Keeping any order/reference information provided to them secure."
          ]
        },
        {
          "type": "p",
          "text": "The User should carefully review the document and print settings before confirming the order."
        }
      ]
    },
    {
      "heading": "18. Prohibited Content and Activities",
      "blocks": [
        {
          "type": "p",
          "text": "Users must not use MPRNT to print, distribute, or facilitate content that is unlawful or prohibited under applicable law."
        },
        {
          "type": "p",
          "text": "This includes content that:"
        },
        {
          "type": "ul",
          "items": [
            "Infringes copyright, trademark, or other intellectual property rights;",
            "Contains unlawful or fraudulent material;",
            "Is intended to facilitate illegal activities;",
            "Contains malicious software or harmful code;",
            "Violates applicable court or government restrictions; or",
            "Otherwise violates applicable laws or regulations."
          ]
        },
        {
          "type": "p",
          "text": "The User is solely responsible for the legality of the content submitted for printing."
        },
        {
          "type": "p",
          "text": "MPRNT may refuse, suspend, or terminate an order where there is a reasonable basis to believe that the service is being misused."
        }
      ]
    },
    {
      "heading": "19. Document Ownership and Intellectual Property",
      "blocks": [
        {
          "type": "p",
          "text": "Users retain ownership of the documents and content they upload, subject to the rights of any third parties."
        },
        {
          "type": "p",
          "text": "By uploading a document, the User confirms that they have the necessary rights, permission, or authorization to reproduce and print that document."
        },
        {
          "type": "p",
          "text": "The User must not use MPRNT to reproduce copyrighted, trademarked, confidential, or otherwise protected material without the required authorization."
        },
        {
          "type": "p",
          "text": "MPRNT does not claim ownership of User documents merely because they are uploaded for printing."
        }
      ]
    },
    {
      "heading": "20. Document Security and Handling",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may process uploaded documents only as reasonably necessary to provide the requested printing service, operate the platform, maintain security, troubleshoot technical issues, and comply with applicable legal requirements."
        },
        {
          "type": "p",
          "text": "Documents may be transmitted to the relevant Partner Print Shop for fulfilment of the User's print order."
        },
        {
          "type": "p",
          "text": "MPRNT will take reasonable technical and organizational measures to protect documents against unauthorized access, misuse, or disclosure."
        },
        {
          "type": "p",
          "text": "However, no digital system or transmission method can be guaranteed to be completely secure. Users should avoid uploading highly sensitive or confidential documents unless they are comfortable using the service for that purpose."
        },
        {
          "type": "p",
          "text": "Further information regarding collection, use, storage, and deletion of personal data is provided in the MPRNT Privacy Policy."
        }
      ]
    },
    {
      "heading": "21. Privacy and Personal Information",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may collect and process certain information required to provide and improve its services."
        },
        {
          "type": "p",
          "text": "This may include information such as:"
        },
        {
          "type": "ul",
          "items": [
            "Contact information, where provided;",
            "Order and transaction details;",
            "Uploaded documents;",
            "Device or technical information;",
            "Usage and service-related information; and",
            "Information required for customer support."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT will handle personal information in accordance with its Privacy Policy and applicable laws."
        },
        {
          "type": "p",
          "text": "Users should review the Privacy Policy before using MPRNT services."
        }
      ]
    },
    {
      "heading": "22. Third-Party Services and Payment Providers",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may use third-party service providers to support certain functions, including:"
        },
        {
          "type": "ul",
          "items": [
            "Payment processing;",
            "Cloud hosting and storage;",
            "Communication services;",
            "Technical infrastructure;",
            "Analytics; and",
            "Other services required to operate the platform."
          ]
        },
        {
          "type": "p",
          "text": "Third-party providers may process information according to their own terms and privacy policies, as applicable."
        },
        {
          "type": "p",
          "text": "MPRNT does not control the internal policies, security practices, or availability of independent third-party services."
        }
      ]
    },
    {
      "heading": "23. Service Availability",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT aims to provide a reliable printing service but does not guarantee that the platform will always be available or uninterrupted."
        },
        {
          "type": "p",
          "text": "The service may temporarily become unavailable due to:"
        },
        {
          "type": "ul",
          "items": [
            "Internet or network issues;",
            "Server or hosting problems;",
            "Printer or hardware failure;",
            "Power outages;",
            "Software or technical maintenance;",
            "Partner Print Shop closure or unavailability;",
            "Payment service interruptions; or",
            "Circumstances beyond MPRNT's reasonable control."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT may temporarily suspend or restrict access to the service for maintenance, security, upgrades, or other operational reasons."
        }
      ]
    },
    {
      "heading": "24. Limitation of Liability",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT will make reasonable efforts to provide the service as described; however, to the extent permitted by applicable law, MPRNT shall not be responsible for losses arising from circumstances beyond its reasonable control."
        },
        {
          "type": "p",
          "text": "This may include:"
        },
        {
          "type": "ul",
          "items": [
            "User-uploaded errors;",
            "Incorrect print settings selected by the User;",
            "Delays caused by Partner Print Shops;",
            "Third-party payment or technology failures;",
            "Internet or network interruptions;",
            "Power failures;",
            "Printer or equipment failures; or",
            "Loss or damage resulting from documents or content submitted by the User."
          ]
        },
        {
          "type": "p",
          "text": "Nothing in these Terms is intended to exclude or limit any liability that cannot legally be excluded or limited under applicable law."
        }
      ]
    },
    {
      "heading": "25. Indemnification",
      "blocks": [
        {
          "type": "p",
          "text": "To the extent permitted by applicable law, the User agrees to be responsible for claims, losses, damages, liabilities, costs, or expenses arising from the User's:"
        },
        {
          "type": "ul",
          "items": [
            "Violation of these Terms & Conditions;",
            "Misuse of the MPRNT platform;",
            "Submission of unlawful or unauthorized content;",
            "Infringement of another person's intellectual property or other rights; or",
            "Violation of applicable laws or regulations."
          ]
        },
        {
          "type": "p",
          "text": "This provision does not limit any rights or remedies available to the User under applicable law."
        }
      ]
    },
    {
      "heading": "26. Intellectual Property of MPRNT",
      "blocks": [
        {
          "type": "p",
          "text": "All intellectual property associated with MPRNT, including its name, logo, branding, software, interface, design, graphics, text, systems, processes, and other original materials, is owned by or licensed to Mlock Innovations LLP, unless otherwise stated."
        },
        {
          "type": "p",
          "text": "Users may use the MPRNT platform only for its intended purpose."
        },
        {
          "type": "p",
          "text": "No User may copy, reproduce, modify, distribute, sell, reverse engineer, or commercially exploit any part of MPRNT without prior written permission from Mlock Innovations LLP, except where permitted by applicable law."
        }
      ]
    },
    {
      "heading": "27. Suspension or Termination",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may suspend, restrict, or terminate access to the service where reasonably necessary, including where:"
        },
        {
          "type": "ul",
          "items": [
            "A User violates these Terms;",
            "The service is being misused;",
            "Fraudulent or unauthorized activity is suspected;",
            "The User submits prohibited or unlawful content;",
            "Required for security or technical reasons; or",
            "Required by applicable law or a lawful government or regulatory direction."
          ]
        },
        {
          "type": "p",
          "text": "Where appropriate, MPRNT may also restrict or discontinue a particular Partner Print Shop or printing service."
        },
        {
          "type": "p",
          "text": "Termination or suspension does not affect rights or obligations that arose before such termination."
        }
      ]
    },
    {
      "heading": "28. Changes to MPRNT Services",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may modify, improve, suspend, replace, or discontinue any part of its services, features, printing options, Partner Print Shops, or technical systems from time to time."
        },
        {
          "type": "p",
          "text": "Changes may be required because of:"
        },
        {
          "type": "ul",
          "items": [
            "Product development;",
            "Technical improvements;",
            "Security requirements;",
            "Business or operational requirements;",
            "Partner availability; or",
            "Changes in applicable laws or regulations."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT will make reasonable efforts to communicate material changes where appropriate."
        }
      ]
    },
    {
      "heading": "29. Changes to These Terms",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT may update these Terms & Conditions from time to time."
        },
        {
          "type": "p",
          "text": "Updated Terms may be published through the MPRNT digital interface or other appropriate communication channels."
        },
        {
          "type": "p",
          "text": "The revised Terms will become effective from the date specified in the updated version."
        },
        {
          "type": "p",
          "text": "Users are encouraged to review the Terms periodically. Continued use of MPRNT after the updated Terms become effective may constitute acceptance of the revised Terms, to the extent permitted by applicable law."
        }
      ]
    },
    {
      "heading": "30. Governing Law",
      "blocks": [
        {
          "type": "p",
          "text": "These Terms & Conditions shall be governed by and interpreted in accordance with the laws applicable in India."
        },
        {
          "type": "p",
          "text": "Any dispute arising in connection with MPRNT or these Terms shall be subject to the jurisdiction of the courts having appropriate jurisdiction over the matter, subject to applicable law."
        },
        {
          "type": "p",
          "text": "Nothing in these Terms limits any mandatory rights or remedies available to consumers under applicable law."
        }
      ]
    },
    {
      "heading": "31. Grievance and Customer Support",
      "blocks": [
        {
          "type": "p",
          "text": "If a User has any complaint, issue, refund request, printing-related concern, or other service-related query, they may contact MPRNT through the official support/contact details provided on the MPRNT platform."
        },
        {
          "type": "p",
          "text": "Users should provide relevant information such as:"
        },
        {
          "type": "ul",
          "items": [
            "Order/reference number;",
            "Date and approximate time of the order;",
            "Partner Print Shop, where applicable;",
            "Description of the issue; and",
            "Relevant payment or transaction information, where required."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT may request additional information reasonably necessary to investigate and resolve a complaint."
        }
      ]
    },
    {
      "heading": "32. Force Majeure",
      "blocks": [
        {
          "type": "p",
          "text": "MPRNT shall not be responsible for delay, interruption, or failure to perform its services where such circumstances arise from events beyond its reasonable control."
        },
        {
          "type": "p",
          "text": "Such events may include:"
        },
        {
          "type": "ul",
          "items": [
            "Natural disasters;",
            "Fire, flood, or other physical disasters;",
            "Government restrictions or orders;",
            "Power or network outages;",
            "Internet or telecommunications failures;",
            "Cybersecurity incidents;",
            "Strikes or disruptions;",
            "War, civil disturbance, or similar events; or",
            "Other circumstances that could not reasonably be prevented or controlled."
          ]
        },
        {
          "type": "p",
          "text": "MPRNT will make reasonable efforts to restore affected services when circumstances permit."
        }
      ]
    },
    {
      "heading": "33. Severability",
      "blocks": [
        {
          "type": "p",
          "text": "If any provision of these Terms & Conditions is found to be invalid, unlawful, or unenforceable by a competent authority, that provision shall be interpreted or modified to the minimum extent necessary to make it enforceable, where legally permissible."
        },
        {
          "type": "p",
          "text": "The remaining provisions of these Terms shall continue to remain in effect."
        }
      ]
    },
    {
      "heading": "34. Entire Agreement",
      "blocks": [
        {
          "type": "p",
          "text": "These Terms & Conditions, together with the MPRNT Privacy Policy and any other policies or notices expressly referenced by MPRNT, constitute the terms governing the User's use of the MPRNT service."
        },
        {
          "type": "p",
          "text": "If there is a conflict between these Terms and a specific service notice communicated for a particular transaction, the specific notice may apply to that transaction to the extent permitted by applicable law."
        }
      ]
    },
    {
      "heading": "35. Contact Us",
      "blocks": [
        {
          "type": "p",
          "text": "For questions, complaints, refund requests, privacy-related concerns, or other matters relating to MPRNT, Users may contact:"
        },
        {
          "type": "lines",
          "lines": [
            "MPRNT",
            "Operated by: Mlock Innovations LLP",
            "Registered Office: 139, Uday Nagar, Indore Kanadia Road, Indore, Madhya Pradesh, India – 452016",
            "Email: mprntindore@gmail.com",
            "Customer Support: +91 89894 94417"
          ]
        }
      ]
    },
    {
      "heading": "36. Final Acceptance",
      "blocks": [
        {
          "type": "p",
          "text": "By accessing or using the MPRNT platform, scanning an MPRNT QR code, uploading a document, placing a print order, or completing a payment, the User confirms that they have read, understood, and agreed to these Terms & Conditions."
        },
        {
          "type": "p",
          "text": "If the User does not agree with any part of these Terms & Conditions, the User should not access or use the MPRNT service."
        },
        {
          "type": "p",
          "text": "These Terms & Conditions, together with the MPRNT Privacy Policy and other applicable policies, govern the User's use of the MPRNT service."
        }
      ]
    }
  ]
};
