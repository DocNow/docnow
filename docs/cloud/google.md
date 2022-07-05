## Google Cloud Service Provider

The following is a step-by-step guide to installing DocNow in Google Cloud. The instructions use terminology for macOS. You should be able to follow these instructions without prior experience with Google Cloud or macOS Terminal, but if this is your first time administering an application, fair warning! This may take up to 2 hours to install.

Please follow each step carefully and open an issue on the [Github
Repository](https://github.com/DocNow/docnow-ansible/issues) if you find
something missing.


***Installing DocNow in Google Cloud will cost money, both for running a server and collecting and storing data. Please remember to turn off your Virtual Private Server (VPS) when you are done to avoid extra charges.***

### 1. Install Ansible

Ansible will be used to configure the Virtual Private Server you will be setting up on [Google Cloud Platform](https://console.cloud.google.com/freetrial). This server will host the DocNow App. 

You will need a Programmers Editors like [Microsoft's VSCode](https://code.visualstudio.com) to make edits below

Start by opening the Terminal application on your Mac in `Applications/Utilities` 

Install Homebrew by copying the following into your Terminal: 

``` /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" ```

*This will take a few minutes*

Then copy the following into your Terminal:

```git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core fetch --unshallow```

*This will take a few minutes*

Then install Ansible by copying the following into your Terminal:

``` brew install ansible ```

Now your computer has the tools it needs to interface with Google Cloud. 

### 2. Set up your Google Cloud account

* Follow the Google Cloud instructions to [create a Platform account here](https://console.cloud.google.com/freetrial). New customers get US$300 in free credits to run applications.

## Create an SSH Key

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

### 3. Create your Virtual Private Server

In the google cloud console create a [Google Cloud project](https://cloud.google.com/resource-manager/docs/creating-managing-projects). 

Make sure that billing is enabled for your [Google Cloud project](https://cloud.google.com/billing/docs/how-to/verify-billing-enabled). 

Enable the [Compute Engine API](https://console.cloud.google.com/apis/api/compute.googleapis.com/overview?_ga=2.129251148.1315088068.1656946944-1480485404.1601406997)

In the Google Cloud console, go to the **Create an instance page**.

Go to [Create an instance](https://console.cloud.google.com/compute/instancesAdd?_ga=2.70352464.1315088068.1656946944-1480485404.1601406997)

In the **Boot disk** section, click **Change** to begin configuring your boot disk.

On the **Public images** tab, choose **Ubuntu** from the **Operating system** list.

Choose **Ubuntu 18.04 LTS** from the **Version** list.

Click **Select**.

In the **Firewall** section, select **Allow HTTP traffic**

To create the Virtual Machine, click **Create**.

Allow a few minutes for the Virtual Machine to Start.

Add your SSH Keys to the Docnow VM with the following steps. 

Go to your [Virtual Machine Instances](https://console.cloud.google.com/compute/instances?_ga=2.69333968.1315088068.1656946944-1480485404.1601406997) page.

Click the Docnow Virtual Machine.

Click **Edit**

Under **SSH Keys**, click **Add item**.

Add the contents of the docnow public key above. The key must be in the following format

```bash
KEY_VALUE: the public key contents above
USERNAME: ubuntu
```
Connect to your Virtual Machine with the following:

 * Open your Terminal Application 
  * Connect to your Virtual Private Server with the following command using the key you created above 

  ```ssh -i ~/.ssh/docnow_id_rsa ubuntu@[yourIPaddresshere]```

  * The resulting screen will look like this:
   ```bash
   The authenticity of host '[yourIPaddresshere] ([yourIPaddresshere])' can't be established.
   ECDSA key fingerprint is SHA256:B7X6z+GIBBERISH+Ozscdht3FB/3WfzcM/076S9ylEh4No.
   Are you sure you want to continue connecting (yes/no/[fingerprint])?
   ```


If you have permissions issues, run the following in Terminal:

```chmod 0400 ~/.ssh/docnow_id_rsa```

You will see:

```
The authenticity of host '[yourIPaddress] [yourIPaddress]' cannot be established.
ED25519 key fingerprint is SHA256:MtFD6zgLJkyr6Ju8nmzwNqwvqy+rayVVnp1NW97DW0s.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[yourIPaddress]' (ED25519) to the list of known hosts.
Welcome to Ubuntu 18.04.1 LTS (GNU/Linux 4.15.0-1021-Linode x86_64)
```
Enter *yes* to connect to your server:

You will see your connection to the server:

```bash
Warning: Permanently added '[yourIPaddresshere]' (ECDSA) to the list of known hosts.
Welcome to Ubuntu 18.04.6 LTS (GNU/Linux 4.15.0-169-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Thu Mar 10 18:31:06 UTC 2022

  System load:  0.02              Processes:           101
  Usage of /:   2.0% of 78.19GB   Users logged in:     0
  Memory usage: 3%                IP address for eth0: [yourIPaddresshere]
  Swap usage:   0%


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

ubuntu@localhost:~#
```
Enter *exit* to logout of your VPS. 

You will see the following:

```bash
logout
Connection to [youIPaddresshere] closed
```

### 4. Launch your application

* Download and unzip the [docnow-ansible](https://github.com/docnow/docnow-ansible) zip file or, if you are a GitHub user, clone the repository to a location on your computer. 
* Move the docnow-ansible folder to your Documents folder
* Modify the `hosts.example` to have the IP address from the steps above. 
* rename the file  `hosts.example` file to `hosts`

Run the following commands in Terminal: 

``` cd /Users/[macOSusername]/Documents/docnow-ansible-main```

```ansible-playbook -i hosts playbooks/gcp_ubuntu_deploy.yml```

When it completes if you point your browser to the IP in the example thus far http://1.2.2.4 you will see the configuration page for your docnow application
