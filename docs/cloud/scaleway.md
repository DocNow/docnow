## Scaleway Service Provider


***The following instructions will cost you money. Please remember to turn off your VPS when you are done***

* Mininally you will need to [install Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) Ansible will be used to configure the Virtual Private Server you will be setting up on [Scaleway](https://www.scaleway.com/en/) that will be hosting the docnow app.
* You will need to [create ssh-keys](https://www.scaleway.com/en/docs/configure-new-ssh-key/)

### Configure your account

* Follow the instructions to [create an account here](https://www.scaleway.com/en/docs/create-your-scaleway-account/)
  * You can generate an API token via the Scaleway [console](https://cloud.scaleway.com/#/credentials) you will need to add that to the [ansible_deployer/group_vars/scaleway/vars.yml](ansible_deployer/group_vars/scaleway/vars.yml) `scw_api_key` variable
  * You will need to use the contents of organization id in your user account in the ![alt text](images/scaleway_org_credentials.png "scaleway organization credentials") [ansible_deployer/group_vars/scaleway/vars.yml](ansible_deployer/group_vars/scaleway/vars.yml) `organization_id` variable.
* Follow the instructions to create and configure an [SSH Key on Scaleway](https://www.scaleway.com/en/docs/configure-new-ssh-key/)
  * You will need to use the contents from the public key above in the [ansible_deployer/group_vars/scaleway/vars.yml](ansible_deployer/group_vars/scaleway/vars.yml) `add_your_key` variable.
  * I strongly recommend [setting a budget limit](https://console.scaleway.com/account/billing) which will automatically stop your instance if you exceed the threshold.


### Create your Virtual Machine

* Create your [Virtual Private Server](https://console.scaleway.com/instance/servers)
  * Select either Ubuntu (Bionic) or Centos (7.6)
  * Select France or Amsterdam
  * Select a Development Instance (We've tested heavily with the 23.99/month one)
  * This is optional but create an easy to identify name and tags. This is only important if you create more than one or need to audit later. 
  * Click Create.
    * You should see the keys you created earlier. If not [create ssh-keys](https://www.scaleway.com/en/docs/configure-new-ssh-key/)
*  You will need to use the contents of `Public IP` on your [ansible_deployer/hosts](ansible_deployer/hosts) under the `[scaleway]` block. 
  * Take not of your `Public DNS` as this will be the URL of your fully configured application


### Launch your application

* From the cloned repository make sure you have the following information updated on [ansible_deployer/group_vars/scaleway/vars.yml](ansible_deployer/group_vars/scaleway/vars.yml). 
  * You have `your_ssh_rsa_public_key: ` with the contents of your public key
  * You have `organization_id: ` with your organization id
  * You have `scw_api_key: ` with your generated scaleway api key
* Make a copy of [ansible_deployer/hosts.example](ansible_deployer/hosts.example) and name the new file `hosts`
  * Enter the `Public IP` to replace the `1.2.3.4`

You are now ready to launch your docnow application. From the `ansible_deployer` directory run the following:

```bash
ansible-playbook playbooks/scaleway_deploy.yml
```

* It takes approximately 10 minutes to completely set up your application.

### Advanced Use

Make sure you have your ssh-keys and have generated an Scaleway API Key. 

```bash
ansible-playbook -i plugins/scaleway_inventory.yml playbooks/scaleway_deploy.yml
```
