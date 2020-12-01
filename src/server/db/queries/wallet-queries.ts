const createCosignersTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.cosigners
(
  	pubkey text NOT NULL,
	"alias" text,
	"created_at" date DEFAULT current_date,
	CONSTRAINT pk_cosigners_pubkey PRIMARY KEY ( pubkey )
)
`;

const createWalletTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.wallets
(
  	id text NOT NULL,
	"wallet_name" text,
	"m" integer,
	n integer,
	"created_at" date,
	initiator text,
	CONSTRAINT pk_wallets_id PRIMARY KEY ( id ),
	CONSTRAINT fk_wallets_cosigners FOREIGN KEY ( initiator ) REFERENCES public.cosigners( pubkey )
)
`;

const createWalletCosignersTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.wallet_cosigners
(
  	"wallet_id" text,
	cosigner text,
	"created_at" date DEFAULT current_date,
	CONSTRAINT "fk_wallet-cosigners_wallets" FOREIGN KEY ( "wallet_id" ) REFERENCES public.wallets( id )   ,
	CONSTRAINT "fk_wallet-cosigners_cosigners" FOREIGN KEY ( cosigner ) REFERENCES public.cosigners( pubkey )
)
`;

const insertWallet = (): string => `
INSERT INTO wallets (id, wallet_name, m, n, created_at, initiator)
VALUES ($1, $2, $3, $4, $5, $6)
`;

const insertCosigner = (): string => `
INSERT INTO cosigners (pubkey, alias, created_at)
VALUES ($1, $2, $3)
ON CONFLICT (pubkey) DO UPDATE
SET alias=$2
`;

const insertCosignerInWallet = (): string => `
INSERT INTO wallet_cosigners (wallet_id, cosigner)
VALUES ($1, $2)
`;

const findWallet = (): string => `
SELECT * FROM wallets
WHERE id = $1
`;

const findCosigners = (): string => `
SELECT wallet_cosigners.cosigner AS pubKey,
	cosigners.alias AS cosignerAlias
FROM wallet_cosigners
INNER JOIN cosigners
ON wallet_cosigners.cosigner = cosigners.pubkey
WHERE wallet_cosigners.wallet_id = $1
`;

const WalletQueries = {
  createCosignersTable,
  createWalletTable,
  createWalletCosignersTable,
  insertCosigner,
  insertWallet,
  insertCosignerInWallet,
  findWallet,
  findCosigners
};

export default WalletQueries;
