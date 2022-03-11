## Scaleway Service Provider


***The following instructions will cost you money. Please remember to turn off your VPS when you are done***


* The following is a step-by-step guide to installing DocNow in Scaleway. The instructions use terminology for macOS. You should be able to follow these instructions without prior experience with AWS or macOS Terminal, but if this is your first time administering an application, fair warning! This may take up to 2 hours to install.

Ansible will be used to configure the Virtual Private Server you will be setting up on Scaleway This server will host the DocNow App. 

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

Now your computer has the tools it needs to interface with Scaleway. 
* You will need to [create ssh-keys](https://www.scaleway.com/en/docs/configure-new-ssh-key/)

### Configure your account

* Follow the instructions to [create an account here](https://www.scaleway.com/en/docs/create-your-scaleway-account/)
  * You can generate an API token via the Scaleway [console](https://cloud.scaleway.com/#/credentials) you will need to add that to the [docnow-ansible/group_vars/scaleway/vars.yml](docnow-ansible/group_vars/scaleway/vars.yml) `scw_api_key` variable
  * You will need to use the contents of organization id in your user account in the ![alt text](../images/scaleway_org_credentials.png "scaleway organization credentials") [docnow-ansible/group_vars/scaleway/vars.yml](docnow-ansible/group_vars/scaleway/vars.yml) `organization_id` variable.
* Follow the instructions to create and configure an [SSH Key on Scaleway](https://www.scaleway.com/en/docs/configure-new-ssh-key/)
  * You will need to use the contents from the public key above in the [docnow-ansible/group_vars/scaleway/vars.yml](docnow-ansible/group_vars/scaleway/vars.yml) `add_your_key` variable.
  * We strongly recommend [setting a budget limit](https://console.scaleway.com/account/billing) which will automatically stop your instance if you exceed the threshold.


### Create your Virtual Machine

* Create your [Virtual Private Server](https://console.scaleway.com/instance/servers)
  * Select either Ubuntu (Bionic) or Centos (7.6)
  * Select France or Amsterdam
  * Select a Development Instance (We've tested heavily with the 23.99/month one)
  * This is optional but create an easy to identify name and tags. This is only important if you create more than one or need to audit later. 
  * Click Create.
    * You should see the keys you created earlier. If not [create ssh-keys](https://www.scaleway.com/en/docs/configure-new-ssh-key/)
*  You will need to use the contents of `Public IP` on your [docnow-ansible/hosts](docnow-ansible/hosts) under the `[scaleway]` block. 
  * Take note of your `Public DNS` as this will be the URL of your fully configured application


### Launch your application

* From the cloned repository make sure you have the following information updated on [docnow-ansible/group_vars/scaleway/vars.yml](docnow-ansible/group_vars/scaleway/vars.yml). 
  * You have `your_ssh_rsa_public_key: ` with the contents of your public key
  * You have `organization_id: ` with your organization id
  * You have `scw_api_key: ` with your generated scaleway api key
* Make a copy of [docnow-ansible/hosts.example](docnow-ansible/hosts.example) and name the new file `hosts`
  * Enter the `Public IP` to replace the `1.2.3.4`

You are now ready to launch your docnow application. From the `docnow-ansible` directory run the following:

```bash
ansible-playbook playbooks/scaleway_deploy.yml
```

* It takes approximately 10 minutes to completely set up your application.

### Advanced Use

Make sure you have your ssh-keys and have generated an Scaleway API Key. 

```bash
ansible-playbook -i plugins/scaleway_inventory.yml playbooks/scaleway_deploy.yml
```
