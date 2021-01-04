{ lib, pkgs, config, ... }:
let
  cfg = config.services.multisig-coordination-server;
in {
  options = {
    services.multisig-coordination-server = {
      enable = lib.mkEnableOption "multisig-coordination-server service";

      port = lib.mkOption {
        type = lib.types.int;
        default = 8080;
      };

      logLevel = lib.mkOption {
        type = lib.types.str;
        default = "debug";
      };

      bindAddress = lib.mkOption {
        type = lib.types.str;
        default = "0.0.0.0";
      };

      dbConnectionString = lib.mkOption {
        type = lib.types.str;
        default = "postgresql://${cfg.dbUser}:${cfg.dbPassword}@${cfg.dbHost}:${toString cfg.dbPort}/${cfg.db}";
      };
      
      pageSize = lib.mkOption {
        type = lib.types.int;
        default = 25;
      };

      dbHost = lib.mkOption {
        type = lib.types.str;
        default = "/run/postgresql";
      };

      dbPassword = lib.mkOption {
        type = lib.types.str;
        default = ''""'';
      };

      dbPort = lib.mkOption {
        type = lib.types.int;
        default = 5432;
      };

      dbUser = lib.mkOption {
        type = lib.types.str;
        default = "mcs";
      };

      db = lib.mkOption {
        type = lib.types.str;
        default = "mcs";
      };
    };
  };
  config = let
    # TODO: there has to be a better way to handle boolean env vars in nodejs???
    boolToNodeJSEnv = bool: if bool then "true" else "false";
    pluginLibPath = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
    ];
    multisig-coordination-server = (import ../../. {}).multisig-coordination-server;
  in lib.mkIf cfg.enable {
    systemd.services.multisig-coordination-server = {
      wantedBy = [ "multi-user.target" ];
      environment = lib.filterAttrs (k: v: v != null) {
        PORT                     = toString cfg.port;
        LOGGER_LEVEL             = cfg.logLevel;
        BIND_ADDRESS             = cfg.bindAddress;
        DB_CONNECTION_STRING     = cfg.dbConnectionString;
        PAGE_SIZE                = toString cfg.pageSize;
      };
      path = with pkgs; [ netcat curl postgresql jq glibc.bin patchelf ];
      script = ''
        exec ${multisig-coordination-server}/bin/multisig-coordination-server
      '';
    };
  };
}
