
# [config]
```
#config username and email.
git config --global user.name "your_name"
git config --global user.email "your_email"
#use command 'git log' and you will see the name and email.

#Password caching(default 15 minutes)
git config --global credential.helper cache
#modify
git config --global credential.helper 'cache --timeout=3600'
```
# 常用命令
```
#Git创建Develop分支的命令：
git checkout -b develop master
#切换到Master分支
git checkout master
#对Develop分支进行合并
git merge --no-ff develop

#功能分支
#创建一个功能分支
git checkout -b feature-x develop
#合并分支
git checkout develop
git merge --no-ff feature-x
#删除feature分支
git branch -d feature-x

#push to remote master
git remote add origin git@github.com:jackshen310/java.git
#if any error occurrences
git remote rm origin
#then
git push -u origin master

#alias
alias gr=' cd /cygdrive/f/GITRepository'
```

# vi commands
http://www.cnblogs.com/88999660/articles/1581524.html