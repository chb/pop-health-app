# How to deploy and run the application on AWS?

## Step 1. Prepare database backup

**Note!** This step is not mandatory. There is an already created backup in the repository (*./terraform/backup.zip*)

AWS allows the creation of a MySQL cluster based on a backup. This backup should be done using the Percona Xtrabackup utility. For more information, see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/MySQL.Procedural.Importing.html.

Prerequisites:
* Docker
* Working directory is a repository root (*./*)

Run Percona MySQL database locally in docker. This database will serve as a base database to back up:
```
> docker run --detach \
    --name percona-server-mysql-5.7 \
    --env MYSQL_ROOT_PASSWORD=root \
    --mount type=bind,src=$(pwd)/docker/dump,dst=/dump \
    percona/percona-server:5.7
```

Log in to the running database docker container:
```
> docker exec --interactive --tty percona-server-mysql-5.7 bash
```

Log into the database and execute dump scripts to populate the database:
```
$ mysql -uroot -proot
$ mysql> source /dump/0_Common.sql
$ mysql> source /dump/1_Observations.sql
$ mysql> source /dump/2_Observations.sql
$ mysql> source /dump/3_Observations.sql
```

In another local terminal prepare a folder for the backup and run Percona Xtrabackup utility to create the backup:
```
> mkdir backup
> docker run \
    --name percona-xtrabackup-2.4 \
    --mount type=bind,src=$(pwd)/backup,dst=/backup \
    --volumes-from percona-server-mysql-5.7 \
    percona/percona-xtrabackup:2.4 \
    xtrabackup --backup --target-dir=/backup --user=root --password=root
```

Verify, that the backup is created successfully (the content of your backup should be similar by structure):
```
> cd ./backup && ls -l
total 155688
-rw-r-----@   1 aliaksei  wheel       487 Feb 14 10:11 backup-my.cnf
drwxr-x---@ 354 aliaksei  wheel     11328 Feb 14 10:11 bulk@002ddata@002dstu@002d3
-rw-r-----@   1 aliaksei  wheel      1330 Feb 14 10:11 ib_buffer_pool
-rw-r-----@   1 aliaksei  wheel  79691776 Feb 14 10:11 ibdata1
drwxr-x---@  77 aliaksei  wheel      2464 Feb 14 10:11 mysql
drwxr-x---@  91 aliaksei  wheel      2912 Feb 14 10:11 performance_schema
drwxr-x---@ 108 aliaksei  wheel      3456 Feb 14 10:11 sys
-rw-r-----@   1 aliaksei  wheel       138 Feb 14 10:11 xtrabackup_checkpoints
-rw-r-----@   1 aliaksei  wheel       442 Feb 14 10:11 xtrabackup_info
-rw-r-----@   1 aliaksei  wheel      2560 Feb 14 10:11 xtrabackup_logfile
```

Zip backup files and move an archive into *./terraform*:
```
> cd ../
> zip -r ./backup.zip ./backup -x ./backup/*
> mv ./backup.zip ./terraform
```

The database backup is ready to be used in the deployment.

## Step 2. Build backend API docker image

Prerequisites:
* Configured ```AWS_ACCESS_KEY_ID```, ```AWS_SECRET_ACCESS_KEY```, ```AWS_REGION``` environment variables for deployment (see https://registry.terraform.io/providers/hashicorp/aws/latest/docs#environment-variables)
* Docker
* Terraform

Create a private ECR repository. The terraform script returns information about created ECR repository (*backend_repository_url* Terraform output variable):
```
> cd ./terraform/infra
> terraform init
> terraform apply -var="component=<COMPONENT>"
  ...
  Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

  Outputs:

  backend_repository_arn = "arn:aws:ecr:<AWS_REGION>:<ACCOUNT_ID>:repository/<COMPONENT>-backend-api"
  backend_repository_registry_id = "<ACCOUNT_ID>"
  backend_repository_url = "<ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<COMPONENT>-backend-api"
```

Build the backend API docker image locally:
```
> cd ../../
> docker build -t <COMPONENT>-backend-api -f ./terraform/backend/Dockerfile .
```

> Please note, if you use Apple Silicon hardware, use the next command to build *linux/arm64* compatible image:
> ```
> docker buildx build --platform=linux/amd64 -t  <COMPONENT>-backend-api -f ./terraform/backend/Dockerfile .
>```

Push the created backend API image into the remote repository (you can find instructions on ECR repository page):
```
> aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
> docker tag <COMPONENT>-backend-api:latest <ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<COMPONENT>-backend-api:latest
> docker push <ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<COMPONENT>-backend-api:latest
```

## Step 3. Build frontend static content

Prerequisites:
* NodeJS 12

Restore npm packages:
```
> npm install
```

Build ReactJS static content:
```
> npm build run
```

Static content is stored in *./build* folder. This content will be deployed to S3.

## Step 4. Deploy the app

Prerequisites:
* Configured ```AWS_ACCESS_KEY_ID```, ```AWS_SECRET_ACCESS_KEY```, ```AWS_REGION``` environment variables for deployment (see https://registry.terraform.io/providers/hashicorp/aws/latest/docs#environment-variables)
* Terraform
* AWS CLI

Navigate to *./terraform* folder and start the deployment script:
```
> cd ./terraform
> terraform init
> terraform apply \
    -var="component=<COMPONENT>" \
    -var="api_task_image=<ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<COMPONENT>-backend-api:latest"
```

It will take about 40-45 min to initially deploy the whole application. The deployment script returns CloudFront URL that can be used to access the app:
```
  Apply complete!

  ...
  Outputs:

  domain_name = "<RANDOM>.cloudfront.net"
>
```

