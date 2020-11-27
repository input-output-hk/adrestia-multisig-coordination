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
	CONSTRAINT "fk_wallet-cosigners_wallets" FOREIGN KEY ( "wallet_id" ) REFERENCES public.wallets( id ),
	CONSTRAINT "fk_wallet-cosigners_cosigners" FOREIGN KEY ( cosigner ) REFERENCES public.cosigners( pubkey )
)
`;

const createTransactionsTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.transactions
(
	id text,
	"wallet_id" text,
	"created_at" date DEFAULT current_date,
	"updated_at" date DEFAULT current_date,
	"unsigned_transaction" text,
	issuer text,
	CONSTRAINT pk_transactions_id PRIMARY KEY ( id ),
	CONSTRAINT "fk_transactions_wallets" FOREIGN KEY ( "wallet_id" ) REFERENCES public.wallets( id ),
	CONSTRAINT fk_transactions_cosigners FOREIGN KEY ( issuer ) REFERENCES public.cosigners( pubkey )
)
`;

const createSignaturesTable = (): string => `
CREATE TABLE IF NOT EXISTS
public.signatures
(
	id text,
	"transaction_id" text,
	cosigner text,
	"created_at" date DEFAULT current_date,
	CONSTRAINT pk_signatures_id PRIMARY KEY ( id ),
	CONSTRAINT "fk_signatures_transactions" FOREIGN KEY ( "transaction_id" ) REFERENCES public.transactions( id ),
	CONSTRAINT fk_signatures_cosigners FOREIGN KEY ( cosigner ) REFERENCES public.cosigners( pubkey )
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

const insertTransaction = (): string => `
INSERT INTO transactions (id, wallet_id, created_at, updated_at, unsigned_transaction, issuer)
VALUES ($1, $2, $3, $4, $5, $6)
`;

const insertSignature = (): string => `
INSERT INTO signatures (id, transaction_id, cosigner, created_at)
VALUES ($1, $2, $3, $4)
`;

const WalletQueries = {
  createCosignersTable,
  createWalletTable,
  createWalletCosignersTable,
  createTransactionsTable,
  createSignaturesTable,

  insertCosigner,
  insertWallet,
  insertCosignerInWallet,
  findWallet,
  findCosigners,

  insertTransaction,
  insertSignature
};

export default WalletQueries;
