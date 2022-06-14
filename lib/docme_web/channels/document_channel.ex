defmodule DocmeWeb.DocumentChannel do
  use Phoenix.Channel

  @impl true
  def join("document:" <> document_id, params, socket) do
    {:ok, _pid} = Document.open(document_id)

    socket =
      socket
      |> assign(:document_id, document_id)
      |> assign(:user_id, Integer.to_string(:rand.uniform(4294967296), 32) <> Integer.to_string(:rand.uniform(4294967296), 32))

    send(self(), :after_join)

    {:ok, socket}
  end

  @impl true
  def terminate(reason, socket) do
    broadcast_from!(socket, "userDisconnected", %{id: socket.assigns.user_id})
  end

  @impl true
  def handle_info(:after_join, socket) do
    response = Document.get_document(socket.assigns.document_id)
    broadcast_from!(socket, "userJoined", %{id: socket.assigns.user_id})

    push(socket, "open", response)

    {:noreply, socket}
  end

  @impl true
  def handle_in("update_cursor", message, socket) do
    broadcast_from!(socket, "updateCursor", message |> Map.merge(%{"id" => socket.assigns.user_id}))

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("update", _message = %{"delta" => %{"ops" => operations}, "version" => client_version}, socket) do
    case Document.update(socket.assigns.document_id, operations, client_version) do
      {:ok, response} -> broadcast_document_changes(response, socket)
      {:error, reason} -> {:reply, {:error, reason}, socket}
    end
  end

  defp broadcast_document_changes(response, socket) do
    broadcast_from!(socket, "update", response)
    push(socket, "updateVersion", response)

    {:reply, :ok, socket}
  end
end