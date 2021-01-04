{ lib, pkgs }:

let
  #nodePackages = pkgs.callPackage ./node-packages {};
  packages = self: {
    sources = import ./sources.nix;
    nodejs = pkgs.nodejs-12_x;
    nix-inclusive = pkgs.callPackage "${self.sources.nix-inclusive}/inclusive.nix" {};
    inherit (self.yarn-static.passthru) offlinecache;
    multisig-coordination-server = self.callPackage ./multisig-coordination-server.nix {};
  };
in pkgs.lib.makeScope pkgs.newScope packages
