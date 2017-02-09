## TCPDump Packet Size Monitor

This is a simple node application to list packets coming from eth0.
I just needed a simpler way of checking which local to remote IP 
is requesting the most data.

App has no limit on list length, so if requests are coming from a 
bunch of ips, your screen size migth not be enough. List is sorted 
by length in descending order.

Requires `tcpdump` installed. Designed for *nix machines, but can 
run on Windows if you have a compiled version of tcpdump, accessible 
from console. Colors might be a problem though...