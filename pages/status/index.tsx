import { StatusResponse } from "pages/api/v1/status";
import useSWR from "swr";

async function fetchAPI(key: string) {
  const response = await fetch(key);
  const jsonResponse = await response.json();
  return jsonResponse;
}

export default function StatusPage() {
  return (
    <>
      <h1>
        <CapsLock text="Status Api" />
      </h1>
      <StatusInfo />
    </>
  );
}

function StatusInfo() {
  const { isLoading, data } = useSWR<StatusResponse>(
    "/api/v1/status/",
    fetchAPI,
    {
      refreshInterval: 2000,
    },
  );
  console.log(data);

  if (isLoading) {
    return <strong>Carregando...</strong>;
  }

  if (!isLoading && data) {
    return (
      <>
        <StatusInfo.Row
          label="Última atualização:"
          value={new Date(data.updated_at).toLocaleString("pt-BR")}
        />
        <StatusInfo.Subtitle text="Dependências" />
        <StatusInfo.Row
          label="Versão banco de dados:"
          value={data.dependencies.database.version}
        />
        <StatusInfo.Row
          label="Máximo de conexões aceitas:"
          value={data.dependencies.database.max_connections.toString()}
        />
        <StatusInfo.Row
          label="Conexões abertas:"
          value={data.dependencies.database.opened_connections.toString()}
        />
      </>
    );
  }
}

interface StatusInfoRowProps {
  label: string;
  value: string;
}

StatusInfo.Row = function StatusInfoRow({ label, value }: StatusInfoRowProps) {
  return (
    <p style={{ display: "flex", gap: 8 }}>
      <strong>
        <CapsLock text={label} />
      </strong>
      <text>{value}</text>
    </p>
  );
};

interface StatusInfoSubtitleProps {
  text: string;
}

StatusInfo.Subtitle = function StatusInfoSubtitle({
  text,
}: StatusInfoSubtitleProps) {
  return (
    <h3>
      <CapsLock text={text} />
    </h3>
  );
};

interface CapsLockProps {
  text: string;
}
function CapsLock({ text }: CapsLockProps) {
  return <text>{text.toUpperCase()}</text>;
}
