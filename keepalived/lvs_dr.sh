#! /bin/bash
# 先在宿主机上安装并以root来启动ipvsadm，每次要在容器中运行ipvs都需要先在宿主机上启动ipvsadm。如果直接进行2步操作将报出错误：
# https://www.cnblogs.com/XiongMaoMengNan/p/8056211.html
echo 1 > /proc/sys/net/ipv4/ip_forward
ipv=/sbin/ipvsadm
vip=192.168.0.38
rs1=192.168.0.18
rs2=192.168.0.28
ifconfig eth0:0 down
ifconfig eth0:0 $vip broadcast $vip netmask 255.255.255.255 up
route add -host $vip dev eth0:0
$ipv -C
$ipv -A -t $vip:80 -s wrr
$ipv -a -t $vip:80 -r $rs1:80 -g -w 3
$ipv -a -t $vip:80 -r $rs2:80 -g -w 1
