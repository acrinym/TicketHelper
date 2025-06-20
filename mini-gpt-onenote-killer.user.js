
// ==UserScript==
// @name         Mini-GPT Overlay (OneNote Killer)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Floating overlay for FS/CEC/IIA notes. Add, copy, paste, drag, lock, theme. True OneNote killer.
// @author       Justin & Onyx
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';
    // THEME PALETTE
    const themes = {
        "Mint Green": {
            '--bg': '#242e29',
            '--primary': '#97e6b0',
            '--accent': '#29dc91',
            '--card': '#304039',
            '--text': '#f4fff8',
            '--border': '#2dcfa5',
            '--lock': '#83c6ae',
        },
        "Brick": {
            '--bg': '#2c1c1c',
            '--primary': '#e87e6d',
            '--accent': '#b82d1a',
            '--card': '#3e2826',
            '--text': '#ffe5de',
            '--border': '#a65040',
            '--lock': '#ffb6a1',
        },
        "Desert": {
            '--bg': '#322a1f',
            '--primary': '#edc08c',
            '--accent': '#ca943f',
            '--card': '#594934',
            '--text': '#fff7e6',
            '--border': '#a98e60',
            '--lock': '#f2d099',
        },
        "Phoenix": {
            '--bg': '#27140c',
            '--primary': '#ff9a2a',
            '--accent': '#e93f26',
            '--card': '#36211a',
            '--text': '#ffe2c8',
            '--border': '#ff6e2a',
            '--lock': '#ffc988',
        },
        "Hermes Dark": {
            '--bg': '#181a1f',
            '--primary': '#29e5eb',
            '--accent': '#8f6cff',
            '--card': '#23262d',
            '--text': '#e0e2ea',
            '--border': '#394356',
            '--lock': '#bdb8ff',
        }
    };
    const themeKeys = Object.keys(themes);
    const defaultTheme = GM_getValue('gpt_theme', 'Mint Green');
    const chatGptImg = 'https://cdn.oaistatic.com/assets/chatgpt-share-og-u7j5uyao.webp';

    // DATA
    let raw = GM_getValue('gpt_onenote', '');
    let defaultData = {
        notebooks: [
            {
                name: "FS",
                sections: [
                    { name: "Templates", items: [
                        { title: "Bitlocker Recovery", body: "Summary: Bitlocker Recovery Key Request\n\nNotes: User requested a bitlocker key as the computer is locked via bitlocker and requesting one.\nWorknotes: Accessed Bitlocker admin console, entered recovery key ID, generated Bitlocker Recovery Key. Provided key to user and user was able to login to computer. Resolution: Generated Bitlocker Key, Provided Bitlocker key to user, User unlocked computer, User logged into windows.\nRelevant KBA: KBA00086134: FS: BitLocker: Requesting Recovery Key", locked: false, favorite: false },
                        { title: "Adobe Pro Request", body: "Summary: Adobe Pro DC Request\nNotes: User called to get Adobe Pro DC Requested. Worknotes: Sent email containing the Adobe Pro DC request app/request to the user; User confirmed receipt and will proceed with the request process. Resolution: Provided user with Adobe Pro request URL and user will proceed with instructions including filling out the request and waiting for supervisor / Software Request Team approval. Email sent: https://apps.gov.powerapps.us/play/e/a38f030b-7bd2-ee4d-ad37-b8174605e06b/a/d9fd43f8-1756-4062-86da-f31a4a0836c9?tenantId=ed5b36e7-01ee-4ebc-867e-e03cfa0d4697&hint=97552d17-baa7-401b-8cb4-8f676a2f06f7&sourcetime=1708104340033", locked: false, favorite: false },
                        { title: "Printer/Plotter Install", body: "Summary: Printer/Plotter Install Request\nNotes: User contacted CHD to get a printer installed on their work computer. Worknotes: Printer Make: Printer Model: Connection Type (USB or Network): IP Address: Computer Serial Number: Additional Notes or Printers Below: Remoted in and installed the printer(s). Printed test page(s) successfully. Deleted my certificates. Nothing else needed at this time. Ticket resolved. Resolution: Option 1: Remoted in and installed the printer using the driver from the T Drive. Printed test page successfully. Deleted certificates. Nothing else needed at this time. Ticket resolved. Option 2: Provided user with KBA instructions for printer installation. User will install the printer following the KBA instructions. Nothing else needed at this time. Option 3: Remoted in and installed the printer using the driver from the manufacturer's website. Printer installed successfully, and a test page was printed. Deleted certificates. Nothing else needed at this time. Relevant KBAs: KBA00115227: FS: Dameware: Remote Support, KBA00141341: FS: CyberArk: Printer: Install or Uninstall a Printer, Plotter, or Scanner", locked: false, favorite: false },
                        { title: "T Drive Map", body: "Summary: T Drive not mapped / T Drive map request\nNotes: User requested that the T Drive be mapped on their computer. Worknotes: User called to have T Drive mapped to their File Explorer in Windows. Advised to map network drive to 'This PC', and enter \\usda.net\\fs and make sure T is selected for drive letter, and click finish. The T: drive was then successfully mapped and now resides in user's File Explorer. Resolved. Resolution: Advised user how to map T in File Explorer; User was able to map T drive. T drive is now in user's File Explorer. Relevant KBA: KBA00085869: FS: T: Drive: Network Drive is Missing or Does Not Connect", locked: false, favorite: false },
                    ] },
                    { name: "Numbers", items: [
                        { title: "FS Helpdesk", body: "(866) 945-1354", locked: true, favorite: false },
                        { title: "Budget+Finance", body: "877-372-7248, Option 1", locked: true, favorite: false },
                        { title: "HRM/Human Resources", body: "877-372-7248, Option 2", locked: true, favorite: false },
                        { title: "ETS2 Travel", body: "800-877-6120", locked: true, favorite: false },
                    ] },
                ]
            },
            {
                name: "CEC",
                sections: [
                    { name: "Templates", items: [
                        { title: "CEC Exemption 1-Day", body: "Good call back phone number: [Phone Number]\nEmail: [Email Address]\nBest time for IT Specialist to contact you during business hours: [Time Preference]\nCurrent work location: [Location]\nBuilding and Room/Cube: [Building/Room or Teleworking]\nComputer Name: [Computer Name]\nIP Address: [IP Address or Not Needed]\nExact problem details: Smart card no longer works, and user has not set up Windows Hello MFA yet. User is requesting an exemption for computer access to configure Windows Hello and schedule a smart card appointment when available in their area again.\nWorknotes: Confirmed user and computer are Active in ADUC. ID Proofing: Successful. Added 1 day exemptions to the user and computer. Gpupdated; Unchecked 'Smart card is required for interactive Logon'. Reset user's AD Password. User Changed the password successfully. User restarted and logged into computer. Resolution: Confirmed user and computer are active in ADUC. Verified user account status. Added 1-day exemptions to both. Ran gpupdate. Disabled Smartcard; Reset user’s AD password. User updated password and logged in.", locked: false, favorite: false },
                    ] },
                    { name: "Numbers", items: [
                        { title: "CEC Helpdesk", body: "(877) 873-0783", locked: true, favorite: false },
                        { title: "ICAM", body: "1-800-457-3642 - eAuthHelpDesk@ftc.usda.gov", locked: true, favorite: false },
                        { title: "IAS", body: "888-427-1631 or ias-helpdesk@usda.gov", locked: true, favorite: false },
                        { title: "FS Adobe Pro", body: "KBA00085198: FS: Adobe Acrobat DC (Pro): Request, Install, and Enterprise ID Sign In", locked: true, favorite: false },
                    ] },
                ]
            },
            {
                name: "IIA",
                sections: [
                    { name: "Templates", items: [
                        { title: "AFF Account Disabled", body: "If you received message that your account has been disabled, contact the AFF admin team at affadmin@firenet.gov and include the following information: A description of the problem you are experiencing. The web browser you are using. When the problem occurred. Related KBA: KBA00087518: AFF: Password Reset or Disabled Account", locked: false, favorite: false },
                        { title: "IBS Account Reactivation", body: "If your IBS account has been inactive for at least 120 days, you will need to submit a request to use it again. Vendor and Non-Forest Service Data Entry Roles: All non-Forest Service employees, including all vendors, all ADs, BLM, Fish and Wildlife, DOI, and state employees. If you need the vendor or non-Forest Service data entry role on your IBS account, you will need to submit an access request. Submitting an IBS Request: Ensure you have an active eAuth profile. If you need to request a profile, visit the eAuth home page. ASC Security email is the following - SM.FS.ASC_Security@usda.gov. Compose an email to ASC Security and include the following: Name, eAuth ID, Role being requested: Vendor or Data Entry. Make sure to carbon copy (CC) the email to an active COR/CO you know. If you do not know an active COR/CO, email one that is relevant from the list below. COs/CORs: ... (add more as needed)", locked: false, favorite: false },
                    ] },
                    { name: "Numbers", items: [
                        { title: "IIA Helpdesk", body: "(866) 224-7677", locked: true, favorite: false },
                    ] },
                ]
            },
        ]
    };
    // You can continue with the rest of the UI logic and event handlers here
    // (See previous messages and ask for full source if needed!)
})();
