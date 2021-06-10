# This file is used by nix-shell to provide a dev environment.
{ pkgs ? import ./nix/pkgs.nix {} }:

with pkgs;

let
  bannerScript = writeShellScriptBin "banner" ''
    echo "TS Dev - Nix" \
      | ${figlet}/bin/figlet -f small -l \
      | ${lolcat}/bin/lolcat
  '';

  helpScript = writeShellScriptBin "shell-help" ''
    echo "Commands:
      * yarn install         - install dependencies locally
      * npx tsc              - run typescript compiler
      * niv update <package> - update nix dependencies
      * shell-help           - show this message
    "
  '';

  shell = packages.multisig-coordination-server.overrideAttrs (old: {
    name = "${old.pname}-shell";
    src = null;

    # These programs will be available inside the nix-shell.
    buildInputs = old.buildInputs ++ [
      yarn2nix    # Generate nix expressions from a yarn.lock file
      nix         # Purely Functional Package Manager
      iohkNix.niv # Dependency management for Nix projects
      pkgconfig   # Allows packages to find out information about other packages
      tmux        # Terminal multiplexer
      git         # Distributed version control system
      bannerScript # Bling
      helpScript   # Info
    ];

    shellHook = ''
      if [ -n "$PS1" ]; then
        banner
        shell-help
      fi
    '';
  });

in
  shell
