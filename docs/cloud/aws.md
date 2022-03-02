## AWS Lightsail Service Provider

The following is a step-by-step guide to installing DocNow in AWS. The instructions use terminology for MacOS. You should be able to follow these instructions without prior experience with AWS or MacOS Terminal, but if this is your first time administering an application, fair warning! This may take up to 2 hours to install.

Please follow each step carefully and open an issue on the [Github
Repository](https://github.com/DocNow/docnow-ansible/issues) if you find
something missing.


***Installing DocNow in AWS will cost money, both for running a server and collecting and storing data. Please remember to turn off your Virtual Private Server (VPS) when you are done to avoid extra charges.***

### 1. Install Ansible

Ansible will be used to configure the Virtual Private Server you will be setting up on [AWS Lightsail](https://aws.amazon.com/lightsail/?p=gsrc&c=ho_lvm). This server will host the DocNow App. 

Start by opening the Terminal application on your Mac in `Applications/Utilities` 

Install Homebrew by copying the following into your Terminal: 

``` /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" ```

*This will take a few minutes*

Then copy the following into your Terminal:

```git -C /usr/local/Homebrew/Library/Taps/homebrew/homebrew-core fetch --unshallow```

*This will take a few minutes*

Then install Ansible by copying the following into your Terminal:

``` brew install ansible ```

Now your computer has the tools it needs to interface with AWS. 

### 2. Set up your AWS account

* Follow the AWS instructions to [create a Lightsail account here](https://portal.aws.amazon.com/billing/signup?client=lightsail&fid=1A3F6B376ECAC516-2C15C39C5ACECACB&redirect_url=https%3A%2F%2Flightsail.aws.amazon.com%2Fls%2Fsignup#/start)


### 3. Create your Virtual Private Server

* Create your [Virtual Private Server](https://aws.amazon.com/getting-started/hands-on/launch-a-virtual-machine/)
  * Instance Location: (any region is OK)
  * Instance Image: Select Linux/Unix platform option 
  * Select blueprint:  "OS Only"
  * Select either Ubuntu (18.04) or Centos (7)
  * Change SSH Key Pair (Create New)
    * Give your Keys a Name and download (for example: LighSailKeyPair) it and save
  * Choose the US$10 option
  * Identify your instance (Give it a name)
  * Create the Instance and take note of the resulting IP address (for example 1.2.2.4) of your Virtual Private Server
  * Open your Terminal Application 
  * Connect to your Virtual Private Server with the following command using the key you created above 

```bash
ssh -i ~/.ssh/LightSailKeyPair.cer ubuntu@1.2.2.4
The authenticity of host '1.2.2.4 (1.2.2.4)' cannot be established.
ED25519 key fingerprint is SHA256:MtFD6zgLJkyr6Ju8nmzwNqwvqy+rayVVnp1NW97DW0s.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '1.2.2.4' (ED25519) to the list of known hosts.
Welcome to Ubuntu 18.04.1 LTS (GNU/Linux 4.15.0-1021-aws x86_64)
```

### 4. Launch your application

* Download and unzip the [docnow-ansible](https://github.com/docnow/docnow-ansible) zip file or, if you are a GitHub user, clone the repository to a location on your computer. 
* Move the docnow-ansible folder to your Documents folder
* Modify the `hosts.example` to have the IP address from the steps above. 
* rename the file  `hosts.example` file to `hosts`

Run the following commands in Terminal: 

``` cd Documents/docnow-ansible```

``` bash ansible-playbook -i hosts playbooks/lightsail_ubuntu_deploy.yml```

When it completes if you point your browser to the IP in the example thus far http://1.2.2.4 you will see the configuration page for your docnow application
