#!/bin/sh
VIP=172.17.0.99
. /etc/rc.d/init.d/functions

case "$1" in
# 禁用本地的ARP请求、绑定本地回环地址
start)
    ip addr add $VIP broadcast $VIP dev lo label lo:0
    ip route add $VIP dev lo:0
    echo "1" >/proc/sys/net/ipv4/conf/lo/arp_ignore
    echo "2" >/proc/sys/net/ipv4/conf/lo/arp_announce
    echo "1" >/proc/sys/net/ipv4/conf/all/arp_ignore
    echo "2" >/proc/sys/net/ipv4/conf/all/arp_announce
    /sbin/sysctl -p >/dev/null 2>&1
    echo "LVS-DR real server starts successfully.n"
    ;;
stop)
    ip addr del $VIP broadcast $VIP dev lo label lo:0
    ip route del $VIP dev lo:0
    echo "1" >/proc/sys/net/ipv4/conf/lo/arp_ignore
    echo "2" >/proc/sys/net/ipv4/conf/lo/arp_announce
    echo "1" >/proc/sys/net/ipv4/conf/all/arp_ignore
    echo "2" >/proc/sys/net/ipv4/conf/all/arp_announce
echo "LVS-DR real server stopped.n"
    ;;
status)
    isLoOn=`ip addr show lo:0 | grep "$VIP"`
    isRoOn=`ip route show | grep "$VIP"`
    if [ "$isLoON" == "" -a "$isRoOn" == "" ]; then
        echo "LVS-DR real server has run yet."
    else
        echo "LVS-DR real server is running."
    fi
    exit 3
    ;;
*)
    echo "Usage: $0 {start|stop|status}"
    exit 1
esac
exit 0