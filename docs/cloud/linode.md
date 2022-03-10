## Linode Service Provider

The following is a step-by-step guide to installing DocNow in Linode. The instructions use terminology for macOS. You should be able to follow these instructions without prior experience with Linode or macOS Terminal, but if this is your first time administering an application, fair warning! This may take up to 2 hours to install.

Please follow each step carefully and open an issue on the [Github
Repository](https://github.com/DocNow/docnow-ansible/issues) if you find
something missing.


***Installing DocNow in Linode will cost money, both for running a server and collecting and storing data. Please remember to turn off your Virtual Private Server (VPS) when you are done to avoid extra charges.***

### 1. Install Ansible

Ansible will be used to configure the Virtual Private Server you will be setting up on [Linode](https://login.linode.com/signup?promo=DOCS32SAFC). This server will host the DocNow App. 

You will need a Programmers Editors like [Microsoft's VSCode](https://code.visualstudio.com) to make edits below. Download and unzip the file at the link to install it.

Start by opening the Terminal application on your Mac in `Applications/Utilities` (you can also search for `terminal`)

Install Homebrew by copying the following into your Terminal: 

``` /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" ``` This step will prompt you for the `macOSusername` password. Please remember to hit `Enter` after each entry. 

*This will take a few minutes*

Then copy the following into your Terminal if this is your first time installing Homebrew:

```git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core fetch --unshallow```

*This will take a few minutes*

Then install Ansible by copying the following into your Terminal:

``` brew install ansible ```

Now your computer has the tools it needs to interface with Linode. 

### 2. Set up your Linode account

* Follow the Linode instructions to [create a Linode account here](https://www.linode.com/docs/guides/getting-started/)

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




### 3. Create your Virtual Private Server

* Create your Linode [Virtual Private Server](https://cloud.linode.com/linodes)
  * Choose a Distribution: Select Ubuntu 18.04 LTS
  * Region: (any region is OK)
  * Linode Plan: Select "Shared CPU/ Linode 4GB"
  * SSH Keys: Select: "Add an SSH Key" Label: Docnow SSH Public Key: "contents of ```cat ~/.ssh docnow_id_rsa.pub``` Add Key
  * Create the Linode and take note of the resulting IP address (for this example we will use 1.2.2.4) of your Virtual Private Server
  * Open your Terminal Application 
  * Connect to your Virtual Private Server with the following command using the key you created above 

```ssh -i ~/.ssh/docnow_id_rsa root@[yourIPaddresshere]```

If you have permissions issues, run the following in Terminal:

```chmod 0400 ~/.ssh/docnow_id_rsa```

```exit```

You will see:

```
The authenticity of host '[yourIPaddress] [yourIPaddress]' cannot be established.
ED25519 key fingerprint is SHA256:MtFD6zgLJkyr6Ju8nmzwNqwvqy+rayVVnp1NW97DW0s.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[yourIPaddress]' (ED25519) to the list of known hosts.
Welcome to Ubuntu 18.04.1 LTS (GNU/Linux 4.15.0-1021-Linode x86_64)
```

### 4. Launch your application

* Download and unzip the [docnow-ansible](https://github.com/docnow/docnow-ansible) zip file or, if you are a GitHub user, clone the repository to a location on your computer. 
* Move the docnow-ansible folder to your Documents folder
* Modify the `hosts.example` to have the IP address from the steps above. 
* rename the file  `hosts.example` file to `hosts`

Run the following commands in Terminal: 

``` cd /Users/[macOSusername]/Documents/docnow-ansible-main```

```ansible-playbook -i hosts playbooks/linode_ubuntu_deploy.yml```

When it completes if you point your browser to the IP in the example thus far http://1.2.2.4 you will see the configuration page for your docnow application
