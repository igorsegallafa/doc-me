defmodule DocmeWeb.DocumentChannel do
  use Phoenix.Channel

  @impl true
  def join("document:" <> document_id, params, socket) do
    {:ok, _pid} = Document.open(document_id)

    socket = assign(socket, :document_id, document_id)
    send(self(), :after_join)

    {:ok, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    response = %{contents: Document.get_contents(socket.assigns.document_id)}
    push(socket, "open", response)

    {:noreply, socket}
  end

  @impl true
  def handle_in("update", payload = %{"ops" => operations}, socket) do
    case Document.update(socket.assigns.document_id, operations) do
      {:ok, response} -> broadcast_document_changes(payload, socket)
      {:error, reason} -> {:reply, {:error, reason}, socket}
    end
  end

  defp broadcast_document_changes(response, socket) do
    broadcast_from!(socket, "update", response)
    {:reply, :ok, socket}
  end
end