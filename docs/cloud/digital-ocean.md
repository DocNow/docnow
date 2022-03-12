# DigitalOcean

The following is a step-by-step guide to installing DocNow in DigitalOceean. The instructions use terminology for macOS. You should be able to follow these instructions without prior experience with DigitalOcean or macOS Terminal, but if this is your first time administering an application, fair warning! This may take up to 2 hours to install.

Please follow each step carefully and open an issue on the [Github
Repository](https://github.com/DocNow/docnow-ansible/issues) if you find
something missing.

### 1. Install Ansible

Ansible will be used to configure the Virtual Private Server you will be setting up on [AWS Lightsail](https://aws.amazon.com/lightsail/?p=gsrc&c=ho_lvm). This server will host the DocNow App. 

You will need a Programmers Editors like [Microsoft's VSCode](https://code.visualstudio.com) to make edits below

Start by opening the Terminal application on your Mac in `Applications/Utilities` 
This can be also found by typing `terminal`' in Spotlight.

Install Homebrew by copying the following into your Terminal: 

``` /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" ```

*This will take a few minutes*

Then copy the following into your Terminal:

```git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core fetch --unshallow```

*This will take a few minutes*

Then install Ansible by copying the following into your Terminal:

``` brew install ansible ```

Now your computer has the tools it needs to interface with DigitalOcean

### 2. Sign up for Digital Ocean

### Create an SSH Key

To host your Docnow Application on Linode you will need SSH
(Secure Shell, allows for secure access to remote servers).

SSH uses public and private keys.

* Your public SSH key is what you'll provide Linode in order to authorize access to your server.
* Your private SSH key remains on your computer and is required to log into your Linode server.

**Creating an SSH keypair**

Open your computer's Terminal:

-   On macOS, this can be found by typing `terminal`' in Spotlight, or under `Applications \> Utilities \> Terminal`.

If you have never created an SSH keypair before, Type the following
command and hit Enter:

```bash
ssh-keygen -f ~/.ssh/docnow_id_rsa
```

This step will save your Linode keys under a hidden directory name
`/Users/[macOSusername]/.ssh` which is the default location of your ssh keys.

Hit Enter without typing anything to save it to the default location. After hitting enter, you will be prompted for an optional passphrase which will encrypt the private SSH key. (This is an added security to protect your
keys, should you ever lose your computer.). 

You now have a public and private key that you'll use to authenticate
with the server you'll create. The screen output will look something like
this:

```bash
Generating public/private rsa key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /Users/[macOSusername]/.ssh/docnow_id_rsa
Your public key has been saved in /Users/[macOSusername]/.ssh/docnow_id_rsa.pub
The key fingerprint is:
SHA256:j0QCWjKqsmvUG2OAhlmFGruiLdpMgcqXwWIePlbi5Qs [macOSusername]@YOURMACOS
The key's randomart image is:
+---[RSA 3072]----+
|  oo+            |
|..o= .           |
|+*.   . .        |
|B+.    o         |
|=*+=    S        |
|@oB*o  . o       |
|*Eo++   . .      |
|+*=..            |
|=.o.             |
+----[SHA256]-----+
```

You can list the contents of the directory by running the following:

```bash
ls -alt ~/.ssh/
```

If this your first time you will see the `docnow_id_rsa`
private key and it's public pair of `docnow_id_rsa.pub`

If you already have keys you will also see `id_rsa` private
key and `id_rsa.pub` public pair.

**Obtaining your public SSH key**

After generating an SSH keypair, run the following command in your
terminal to display your public key:

```bash
cat ~/.ssh/docnow_id_rsa.pub*
```

Copy all the output to a text file, as we'll use it when creating a
DigitalOcean droplet in the next steps.

Your machine will connect to a server and admin that you alone have
access to, and from which you control the machine's settings.


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

**Do not click the green create button yet**, as we'll continue to
additional options in the next steps.

# Droplet creation (options & SSH key)

After choosing the droplet size, and location closest to you, consider
checking the box for **Monitoring** in the additional options section:

The monitoring option will allow you to later track your droplet's
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

you've logged into your server. You are now ready to install the docnow
software

### 3. Installing the Docnow software

* Download and unzip the [docnow-ansible](https://github.com/docnow/docnow-ansible) zip file or, if you are a GitHub user, clone the repository to a location on your computer. 
* Move the docnow-ansible folder to your Documents folder
* Modify the `hosts.example` to have the IP address from the steps above. 
* rename the file  `hosts.example` file to `hosts`

```bash
 ansible-playbook -i hosts playbooks/do_install.yml
```

-   When your playbook runs you will be able to access your docnow
    application the the DigitalOcean IP address above. Point your
    browser to <http://1.2.3.4> (substituting the 1.2.3.4 with your
    DigitalOcean IP address)
