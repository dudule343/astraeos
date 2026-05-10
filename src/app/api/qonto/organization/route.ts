import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BankAccount = {
  iban: string;
  bic: string;
  balance: number;
  balance_cents: number;
  currency: string;
  name: string;
  main: boolean;
  status: string;
  updated_at?: string;
};

type QontoPayload = {
  connected: boolean;
  source: "live" | "mock";
  organization: {
    slug: string;
    legal_name: string;
  };
  main_account: BankAccount | null;
  bank_accounts: BankAccount[];
  fetched_at: string;
  error?: string;
};

const MOCK: QontoPayload = {
  connected: false,
  source: "mock",
  organization: { slug: "priveos", legal_name: "PRIVEOS" },
  main_account: {
    iban: "FR76 1660 8000 0112 3456 7890 142",
    bic: "QNTOFRP1XXX",
    balance: 360000,
    balance_cents: 36000000,
    currency: "EUR",
    name: "Compte principal · Qonto",
    main: true,
    status: "active",
    updated_at: "2026-05-09T11:47:00Z",
  },
  bank_accounts: [],
  fetched_at: new Date().toISOString(),
};

export async function GET() {
  const auth = process.env.QONTO_AUTH;

  if (!auth) {
    return NextResponse.json(MOCK);
  }

  try {
    const res = await fetch("https://thirdparty.qonto.com/v2/organization", {
      headers: { Authorization: auth, "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ...MOCK, error: `Qonto API ${res.status}` },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      organization: {
        slug: string;
        legal_name: string;
        bank_accounts: BankAccount[];
      };
    };

    const accounts = data.organization.bank_accounts ?? [];
    const main = accounts.find((a) => a.main) ?? accounts[0] ?? null;

    const payload: QontoPayload = {
      connected: true,
      source: "live",
      organization: {
        slug: data.organization.slug,
        legal_name: data.organization.legal_name,
      },
      main_account: main,
      bank_accounts: accounts,
      fetched_at: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { ...MOCK, error: err instanceof Error ? err.message : "fetch failed" },
      { status: 200 },
    );
  }
}
