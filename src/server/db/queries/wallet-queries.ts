const createCosignersTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.cosigners
(
  pubkey               text  NOT NULL ,
	"alias"              text   ,
	"create_date"        date DEFAULT current_date  ,
	CONSTRAINT pk_cosigners_pubkey PRIMARY KEY ( pubkey )
)
`;

const createWalletTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.wallets
(
  id                   text  NOT NULL,
	"wallet_name"        text,
	"m"                  integer,
	n                    integer,
	"create_date"        date,
	initiator            text,
	CONSTRAINT pk_wallets_id PRIMARY KEY ( id ),
	CONSTRAINT fk_wallets_cosigners FOREIGN KEY ( initiator ) REFERENCES public.cosigners( pubkey )
)
`;

const createWalletCosignersTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.wallet_cosigners
(
  "wallet_id"          text   ,
	cosigner             text   ,
	"create_date"        date DEFAULT current_date  ,
	CONSTRAINT "fk_wallet-cosigners_wallets" FOREIGN KEY ( "wallet_id" ) REFERENCES public.wallets( id )   ,
	CONSTRAINT "fk_wallet-cosigners_cosigners" FOREIGN KEY ( cosigner ) REFERENCES public.cosigners( pubkey )
)
`;

const insertWallet = (): string => `
INSERT INTO wallets (id, wallet_name, m, n, create_date, initiator)
VALUES ($1, $2, $3, $4, $5, $6)
`;

const insertCosigner = (): string => `
INSERT INTO cosigners (pubkey, alias, create_date)
VALUES ($1, $2, $3)
ON CONFLICT (pubkey) DO UPDATE
SET alias=$2
`;

const insertCosignerInWallet = (): string => `
INSERT INTO wallet_cosigners (wallet_id, cosigner)
VALUES ($1, $2)
`;

const WalletQueries = {
  createCosignersTable,
  createWalletTable,
  createWalletCosignersTable,
  insertCosigner,
  insertWallet,
  insertCosignerInWallet
};

export default WalletQueries;
