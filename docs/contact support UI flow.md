### Document: Contact Support Modal or Fallback to Email Client Logic Flow

---

#### **Overview**
This document outlines the logic flow for determining whether the Practera app displays a **HubSpot support form modal** or falls back to the **email client** for user support. The decision is based on the email address configured in the admin settings.

---

### **Logic Flow**

#### **1. Input: Support Email Address**
The support email address is retrieved from the current experience's configuration in the app's storage.

#### **2. Conditions**
The app evaluates the email address to determine the appropriate support path:

1. **Practera Support Email**:
   - If the email address contains `@practera.com`, the app:
     - Activates the **HubSpot support form modal**.
     - Users can submit their queries directly within the app.
   - Example: `support@practera.com`.

2. **Custom Support Email**:
   - If the email address does **not** contain `@practera.com`, the app:
     - Falls back to the **email client**.
     - Opens the user's default email client with a pre-filled subject line containing the current program name.
   - Example: `support@customdomain.com`.

3. **Default Fallback**:
   - If no email address is configured, the app uses the default Practera helpline email (`programs@practera.com`) and opens the email client.

---

### **Logic Implementation**

#### **Key Functions**
1. **`checkIsPracteraSupportEmail()`**:
   - Checks if the configured email address contains `@practera.com`.
   - Broadcasts an event (`support-email-checked`) with `true` or `false` to notify other parts of the app.

   ```typescript
   checkIsPracteraSupportEmail() {
       const currentExperience = this.storageService.get('experience');
       if (currentExperience && currentExperience.supportEmail) {
           const supportEmail = currentExperience.supportEmail;
           if (supportEmail.includes("@practera.com")) {
               this.broadcastEvent('support-email-checked', true);
               return true;
           }
           this.broadcastEvent('support-email-checked', false);
           return false;
       }
       this.broadcastEvent('support-email-checked', false);
       return false;
   }
   ```

2. **`openSupportPopup(event)`**:
   - Determines whether to show the HubSpot modal or fallback to the email client based on the `hubspotActivated` flag.

   ```typescript
   async openSupportPopup(event): Promise<void> {
       if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
           return;
       }
       if (this.hubspotActivated === true) {
           const componentProps = {
               mode: 'modal',
               isShowFormOnly: true,
           };

           const modal = await this.modalController.create({
               componentProps,
               component: SupportPopupComponent,
               cssClass: 'support-popup',
               backdropDismiss: false,
           });

           return modal.present();
       }

       return this.mailTo(event);
   }
   ```

3. **`mailTo(event)`**:
   - Opens the email client with a pre-filled subject line and recipient email address.

   ```typescript
   mailTo(event) {
       if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
           return;
       }

       let mailto = `mailto:${this.helpline}?subject=${this.currentProgramName}`;
       const supportEmail = this.utils.getSupportEmail();

       if (!this.utils.checkIsPracteraSupportEmail() && !this.utils.isEmpty(supportEmail)) {
           mailto = `mailto:${supportEmail}?subject=${this.currentProgramName}`;
       }
       window.open(mailto, '_self');
   }
   ```

---

### **Logic Flow Diagram**

```plaintext
Start
  |
  v
Retrieve Support Email Address (after experience selection / login)
  |
  v
Is Email Address Practera Support Email? (contains "@practera.com")
  | Yes                          | No
  v                              v
Show HubSpot Modal          Open Email Client
  |                              |
  v                              v
User Submits Query         Pre-fill Email with:
                           - Recipient: Support Email
                           - Subject: Current Program Name
  |
  v
End
```

---

### **Default Email Address**
If no email address is configured in the admin settings, the app defaults to using `programs@practera.com` as the recipient email.

---

### **How to Configure the Support Email**
1. Go to the **Admin Settings** in the Practera platform.
2. Locate the **Support Email** field under the current experience or program settings.
3. Enter a valid email address:
   - Use a `@practera.com` email for HubSpot integration.
   - Use a custom email for fallback to the email client.
4. Save the changes.

---

### **Supported and Unsupported Configurations**

#### **Supported Configurations**
- **Practera Support Email**: Enables HubSpot modal.
- **Custom Support Email**: Falls back to the email client.

#### **Unsupported Configurations**
- **Empty or Missing Email Address**: Defaults to `programs@practera.com`.

---

### **Testing**
- Test with both Practera and custom email addresses.
- Verify the HubSpot modal opens for Practera emails.
- Verify the email client opens with the correct pre-filled details for custom emails.
- Test fallback to the default email address when no email is configured.

---

This document ensures clarity on the logic flow and configuration for the support functionality in the Practera app.