---
tags: []
aliases: []
publish: true
permalink: homeec25
date created: Thursday, April 3rd 2025, 2:21 pm
date modified: Thursday, April 3rd 2025, 4:57 pm
---

# Open Lab Agenda

1. Check for email breaches
	- [haveibeenpwned.com > Check if your email has been compromised in a data breach](https://haveibeenpwned.com/)
	- [npdbreach.com > National Public Data (NPD) Breach Check & Search](https://npdbreach.com/)
2. Password manager setup (if possible)
	- [Bitwarden: Password Manager](https://get.bitwarden.com/)
	- [proton.me > Proton Pass: Password manager download](https://proton.me/pass/download)
3. Get MFA set up on an important account - 2 step verification
	- Accounts to do it for:
		- Email account
		- Bank account or credit cards
	- Guides:
		- [cisa.gov > Turn On MFA | CISA](https://www.cisa.gov/secure-our-world/turn-mfa)
		- [google.com > Turn on 2-Step Verification - Computer - Google Account Help](https://support.google.com/accounts/answer/185839)
		- [apple.com > Use two-factor authentication for your Apple Account on iPhone](https://support.apple.com/guide/iphone/use-two-factor-authentication-iphd709a3c46/ios)
4. Discussions

# Steps to Securing Your Digital Life

> [!tip] If you need help doing this
Find someone who knows technology, and show them this guide.  They may have better ways of doing things, but it's best to find someone who can help you with the technology and teach you.

## 1) Check if your email has been in a breach 

Go to the below website and type in your email to check for security breaches:
- [haveibeenpwned.com > Check if your email has been compromised in a data breach](https://haveibeenpwned.com/)

Last year (April 2024) had a huge breach of social security numbers.  Type in your name and address to see if your data was included.
- [npdbreach.com > National Public Data (NPD) Breach Check & Search](https://npdbreach.com/)

> [!info] FYI
> Typing in your email is not a security risk to you.  It merely checks your email against a public database of known security breaches.  No data is shared with the website other than to check against the database.

If you want your data removed from these websites then you may do so, but it's not easy
- [Link to guide for removing data](https://inteltechniques.com/exposure.html)

### If your passwords have been compromised

> [!attention] Start using a [password manager](🕸️%20UNSTRUCTURED/Home-Ec%202025/Home-Ec%202025.md#2%20Download%20and%20start%20using%20a%20password%20manager) and change the passwords on compromised websites.
> - If you have reused passwords on major accounts (e.g. email, bank, phone companies), then change those passwords first

## 2) Download and start using a password manager

> [!important] 
> Using a password manager means you...
> - Don't have to remember all of your passwords
> - Don't need to reuse passwords
> - Only need ONE good password
> - Your passwords autofill into login pages

> [!warning] Reuse of passwords is incredibly dangerous.  If one gets breached, then they all do.

- Both of the below options are good:
	- [Bitwarden: Password Manager](https://get.bitwarden.com/)
	- [proton.me > Proton Pass: Password manager download](https://proton.me/pass/download)

> [!info]- Click for Password Statistics
> - **Passwords are the dominant form of authentication**
>     - **83% of organizations use password-based authentication** for some IT resources (JumpCloud's 2024 IT Trends Report)
>     - FIDO Alliance study from 2022
> - Data Breach Stats
>     - **80% of data breaches involved password stealing or cracking** at some step of the attack chain (Verizon DBIR 2022)
>     - **~40% of breaches were the result of an attacker using credentials to initially break into systems** (data from ~7000 companies - Verizon DBIR 2024)
>     - **68% of breaches involved a human element** (password management, social engineering) (data from ~14,700 companies - Verizon DBIR 2024)
>     - Out of all breaches, **~50% involved breaking into Web Applications with credentials** (including employee passwords) (data from 10,000+ companies Verizon DBIR 2024)
> - People reuse passwords
>     - **~60% of passwords were reused on multiple accounts** (SpyCloud Credential Exposure Report from 2021). This data is from a real-world sample of compromised user logins for millions of users on thousands of websites (1.5 billion+ logins total)

### Using Bitwarden for Passwords

- [bitwarden.com > Bitwarden Learning Center](https://bitwarden.com/help/learning-center/)

> [!info] Random tips for Bitwarden:
> - Set up an "[organization](https://bitwarden.com/help/getting-started-organizations/)" in the app so you and your family can have shared passwords for things like streaming services, groceries, etc.
> - Use a [biometric](https://bitwarden.com/help/biometrics/) login for fast login - uses thumbprint or face if your phone allows it
> - Use the [password generator](https://bitwarden.com/help/generator/#tab-mobile-6xKx6UelBVUbCceB9IupEa) when you make new passwords
> - Use [Bitwarden Send](https://bitwarden.com/products/send/) to share sensitive documents and passwords

### Is using a physical notebook fine?

- If you use paper for passwords, you MUST still make [good passwords](🕸️%20UNSTRUCTURED/Home-Ec%202025/Home-Ec%202025.md#What%20makes%20a%20good%20password) and NOT reuse them

> [!faq] I don't recommend storing passwords in your browser.  

### What makes a good password?

A password needs to be:
1) Easy to remember
2) Easy to type
3) HARD to guess
	- Don't use pet names in it
	- Don't use birthdays
	- There must be a random word unrelated to you in it
	- Nothing that could be found on social media
4) Long - ideally 14+ characters, but 12 is "fine"

> [!tip] Look at the Bitwarden password generator online to 

## 3) Enable MFA (multi-factor authentication) or 2FA (two-factor authentication)

[cisa.gov > Turn On MFA | CISA](https://www.cisa.gov/secure-our-world/turn-mfa)

- Especially on...
	- Email account
	- Bank Account apps
	- Credit card apps

## 4) Defending against scams and "phishing" attacks

- Email and Text are untrustworthy - be skeptical
- Videos:
	- AI allows scammers to fake voices now -  [youtube.com > How scammers fake your voice? #shorts](https://www.youtube.com/watch?v=6HIENbTgLiA&list=PLAo444udA0qxfNyiQBGxLkMqfe_HWTq3e&index=3)

>[!summary] Quick tips for avoiding scams and "phishing"...
> - Don't click on links in emails from people you don't trust.
> - "If it seems too good to be true, it probably is."
> - "Would I be expecting this email from this person, at this time, in this way?"
> - "Hover before you click."
> - "Stop. Think. Connect." - connect to the person on a different communication channel if they're someone you know personally to see if they sent it.
> - When in doubt, type in the website into your browser and go there yourself to login
> - Never share a code sent to your email or phone number with someone.  Only type it back into the website that sent it to you.

### Spam blocking services

- [https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts](https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts)
- [https://www.fcc.gov/call-blocking](https://www.fcc.gov/call-blocking) - tons of apps mentioned by the FCC
- [Nomorobo](https://www.nomorobo.com/signup) - call blocking on mobile or VOIP

---

## 5) For your children

- Protect them from going to dangerous websites - [covenanteyes.com > Screen Accountability™](https://www.covenanteyes.com/)
- Set up family settings on gaming consoles and other devices

## 6) Other Tips & Beyond

### Freeze Your Credit

Look up "how to freeze credit".

- [inteltechniques.com > Credit Freeze Guide](https://inteltechniques.com/freeze.html)
- [How to place or lift a security freeze on your credit report | USAGov](https://www.usa.gov/credit-freeze)

### Change the privacy settings on your most-used app/apps

- Choose an app to look at:
    - Your browser - Chrome, Safari
        - (or download a privacy respecting browser like "Brave browser")
    - Social media - Meta (Instagram, Facebook), YouTube, TikTok, Snapchat, Pinterest
    - **Google** or **Apple** accounts - Any privacy settings on these (including map apps)
    - Search Engine - also usually Google
        - (or start using a privacy-respecting search engine)

### Audit your phone's privacy settings

- Go through your phone's security and privacy settings
- Some guides on areas to look at:
	- Android guide example - [https://ssd.eff.org/module/how-to-get-to-know-android-privacy-and-security-settings#level-1-everyday-essentials](https://ssd.eff.org/module/how-to-get-to-know-android-privacy-and-security-settings#level-1-everyday-essentials)
	- iPhone guide example - [https://ssd.eff.org/module/how-to-get-to-know-iphone-privacy-and-security-settings#level-1-everyday-essentials](https://ssd.eff.org/module/how-to-get-to-know-iphone-privacy-and-security-settings#level-1-everyday-essentials)

### Don't use a VPN (...usually)

- The only reason to use a VPN is if you travel a lot or you need access to a TV show from a different country on your phone.

- If you have to, the most trusted ones seem to be:
	- [protonvpn.com > The best VPN for speed and security](https://protonvpn.com/)
	- [mullvad.net > Free the internet](https://mullvad.net/en)
	- [ivpn.net > VPN for Privacy & Security | IVPN | Resist Online Surveillance](https://www.ivpn.net/en/)