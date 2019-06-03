#!/bin/bash
swap_info=`swapon --summary`
if [ -f  ]; then
    fallocate -l 512M /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile none swap defaults 0 0" >> /etc/fstab
    echo `swapon --summary`

chmod +x create_swap.sh