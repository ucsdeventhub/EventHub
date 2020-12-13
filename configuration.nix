{ configm, pkgs, modulesPath, ... }:

{
  imports = [ "${modulesPath}/virtualisation/amazon-image.nix" ];
  ec2.hvm = true;

  environment.systemPackages = with pkgs; [
    bash
    vim
    sqlite
    gcc
    go
    git
  ];

  networking.firewall.allowedTCPPorts = [ 22 80 443 ];

  systemd.services.EventHubApi = {
	wantedBy = [ "multi-user.target" ];
	after = [ "network.target" ];
	serviceConfig = {
		User = "eventhub";
		ExecStart = "/home/eventhub/EventHub/cmd/eventhub/eventhub";
		WorkingDirectory = "/home/eventhub/EventHub/";
	};
	environment = {
		EVENTHUB_SENDGRID_API_KEY = FAIL HERE
	};
  };

  services.nginx = {
	enable = true;
	virtualHosts."eventhub.ear7h.net" = {
	  default = true;
	  locations."/api/".proxyPass = "http://localhost:8080";
	  locations."/" = {
		root = "/home/eventhub/EventHub/ui/build";
		index = "index.html";
		tryFiles = "$uri /index.html =404";
	  };
	  extraConfig = "autoindex on;";
	};
  };

  systemd.services.nginx.serviceConfig.ProtectHome = false;

  users.users.eventhub = {
    isNormalUser = true;
    home = "/home/eventhub";
    createHome = true;
  };

  users.users.julio = {
    isNormalUser = true;
    home = "/home/julio";
    createHome = true;
    extraGroups = ["wheel"];
  };
}

