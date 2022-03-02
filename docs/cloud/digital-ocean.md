# DigitalOcean

DigitalOcean, Inc. ([digitalocean.com](http://digitalocean.com)) is a
cloud infrastructure provider that provides cloud services to developers
to help to deploy and scale applications that run simultaneously on
multiple computers.

The following is a step-by-step guide to installing DocNow using
macOS.

It is intended for anyone without prior experience.

Please follow each step carefully and open an issue on the [Github
Repository](https://github.com/DocNow/docnow-ansible/issues) if you find
something missing.

# Create an SSH Key

To host your Docnow Application on DigitalOcean you will need SSH
(Secure Shell, allows for secure access to remote servers).

SSH uses public and private keys.

* Your public SSH key is what you\'ll provide DigitalOcean in order to authorize access to your server.
* Your private SSH key remains on your computer and is required to log into your DigitalOcean server.

**Creating an SSH keypair**

Open your computer\'s Terminal:

-   On macOS, this can be found by typing `terminal`' in Spotlight, or under `Applications \> Utilities \> Terminal`.

If you have never created an SSH keypair before, Type the following
command and hit Enter:

```bash
ssh-keygen -f ~/.ssh/docnow_id_rsa
```

This will save your DigitalOcean keys under a hidden directory name
`/Users/<macOSusername>/.ssh` which is the default location of your ssh keys.
You can list the contents of the directory by running the following:

```bash
ls -alt ~/.ssh/
```

If this your first time you will see the `docnow_id_rsa`
private key and it's public pair of `docnow_id_rsa.pub]`

If you already have keys you will also see `id_rsa` private
key and `id_rsa.pub` public pair.

You'll then be prompted to enter the file where you want to save the
key. If you've never created an SSH key before on this computer, hit
Enter without typing anything to save it to the default location.

```bash
Generating public/private rsa key pair.
Enter file in which to save the key
(/Users/username/.ssh/docnow_id_rsa):
```

After hitting enter, you'll be prompted for an optional passphrase which
encrypts the private SSH key. (This is an added security to protect your
keys, should you ever lose your computer.)

We strongly recommend setting a passphrase. Keep in mind forgetting this
passphrase will at least temporarily lock you out of your DigitalOcean
server droplet.

```bash
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

⚠️Note: Nothing will appear in the terminal as you enter your
passphrase. This is intentional. You\'re still typing though.

You now have a public and private key that you\'ll use to authenticate
with the server droplet you\'ll create. The screen output will look like
this:

```bash
Your identification has been saved in
/Users/username/.ssh/docnow_id_rsa.
Your public key has been saved in
/Users/username/.ssh/docnow_id_rsa.pub.

The key fingerprint is:

a9:49:EX:AM:PL:E3:3e:a9:de:4e:77:11:58:b6:90:26 username@mac-mini

The key's randomart image is:
+--[ RSA 2048]----+
\| ..o \|
\| E o= . \|
\| o. o \|
\| .. \|
\| ..S \|
\| o o. \|
\| =o.+. \|
\| . =++.. \|
\| o=++. \|
+-----------------+
```

**Obtaining your public SSH key**

After generating an SSH keypair, run the following command in your
terminal to display your public key:

```bash
cat ~/.ssh/docnow_id_rsa.pub*
```

Copy all the output to a text file, as we\'ll use it when creating a
DigitalOcean droplet in the next steps.

# Sign up for Digital Ocean

Your machine will connect to a server and admin that you alone have
access to, and from which you control the machine\'s settings.

DocNow is written to run on most cloud providers including DigitalOcean
and you will need a virtual private server host (VPS).

(Advanced users may install the docnow application using DigitalOcean\'s
API.)

**Create an account**

To begin, sign up for a DigitalOcean account here:
<https://cloud.digitalocean.com/registrations/new>

Provide them with your billing information.

⚠️ IMPORTANT:

**You must set up two-factor authentication (2FA)** on your Digital
Ocean account, and securely store the backup codes, to protect your
crypto and cash.

Use **only** the authenticator app (HOTP) option, and not SMS-based
authentication: <https://cloud.digitalocean.com/settings/security>

# Droplet creation (image & size)

After setting up your DigitalOcean account, click Create \> Droplets in
the top right corner to start a new server:

Click the dropdown box under **Ubuntu** and choose **18.04 x64** as the
distribution (instead of the default 20.04):

Select the **4 GB / 2 CPUs** option for your droplet size:

**Do not click the green create button yet**, as we\'ll continue to
additional options in the next steps.

# Droplet creation (options & SSH key)

After choosing the droplet size, and location closest to you, consider
checking the box for **Monitoring** in the additional options section:

The monitoring option will allow you to later track your droplet\'s
resource usage from your DigitalOcean account.

Then, under the **Authentication** section, choose **`SSH keys`** and
click **`New SSH Key`**.

In the dialogue box, paste the **public SSH key** you obtained earlier
during key creation, name it, and click add:

Enter a hostname of your choosing, then click the green **Create**
button:

# Logging into your server

After creating the droplet, note its **IP Address** shown on the
following DigitalOcean screen:

Open your computer's **Terminal** again if it's not still open. On
macOS, this can be found by typing `terminal` in Spotlight, or under
`Applications \> Utilities \> Terminal`.

Then, run the following, but replacing 1.2.3.4 with the IP address of
your droplet, and hit Enter:

```bash
ssh root@1.2.3.4*
```

You'll be asked if you're sure you want to continue connecting. Type
yes and hit Enter.

Then, you'll be prompted to enter the password you protected your SSH
key with when creating it. Do so, and hit Enter.

⚠️Note: Nothing will appear in the terminal as you enter your
passphrase. This is intentional. You're still typing though.

When you see the prompt

```bash
root@your-droplet:~#
```

instead of

```bash
your-name@your-mac ~ %
```

you\'ve logged into your server. You are now ready to install the docnow
software

# Installing the Docnow software

-   Consider installing [homebrew](https://brew.sh/)
-   Most versions of macOS already have git installed. If you happen to
    find yours not to have it installed. We recommend using the homebrew
    option listed in the instructions to [install and configure
    git](https://github.com/git-guides/install-git).

```bash
your-name@your-mac ~ % brew install git
```

-   You can follow the instructions to install
    [Ansible](https://www.ansible.com/). Othewise if you installed
    homebrew above install ansible via

```bash
your-name@your-mac ~ % brew install ansible
```

-   Edit the `hosts.example` file in the cloned
    docnow-ansible repository. Replace the [1.2.3.4` in the
    file with your DigitalOcean Droplet IP address above. Make a copy of
    the file and name it `hosts`
-   You can now run:

```bash
your-name@your-mac ~ % ansible-playbook -i hosts playbooks/do_install.yml
```

-   When your playbook runs you will be able to access your docnow
    application the the DigitalOcean IP address above. Point your
    browser to <http://1.2.3.4> (substituting the 1.2.3.4 with your
    DigitalOcean IP address)
