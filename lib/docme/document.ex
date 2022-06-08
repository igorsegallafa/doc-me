defmodule Document do
  use GenServer

  @initial_state %{
    # Number of changes made to the document so far
    version: 0,

    # An up-to-date Delta with all changes applied, representing
    # the current state of the document
    contents: [],

    # The `inverted` versions of all changes performed on the
    # document (useful for viewing history or undo the changes)
    inverted_changes: [],
  }


  # Public API
  # ----------

  def start_link(id), do: GenServer.start_link(__MODULE__, :ok, name: name(id))
  def stop(id),  do: GenServer.stop(name(id))

  def open(id) do
    case GenServer.whereis(name(id)) do
      nil -> DynamicSupervisor.start_child(DocumentSupervisor, {__MODULE__, id})
      pid -> {:ok, pid}
    end
  end

  def update(id, change), do: GenServer.call(name(id), {:update, change})
  def get_contents(id),   do: GenServer.call(name(id), :get_contents)
  def get_history(id),    do: GenServer.call(name(id), :get_history)
  def undo(id),           do: GenServer.call(name(id), :undo)

  defp name(id), do: {:global, {:doc, id}}

  # GenServer Callbacks
  # -------------------

  # Initialize the document with the default state
  @impl true
  def init(:ok), do: {:ok, @initial_state}

  # Apply a given change to the document, updating its contents
  # and incrementing the version
  #
  # We also keep track of the inverted version of the change
  # which is useful for performing undo or viewing history
  @impl true
  def handle_call({:update, change}, _from, state) do
    inverted = Delta.invert(change, state.contents)

    state = %{
      version: state.version + 1,
      contents: Delta.compose(state.contents, change),
      inverted_changes: [inverted | state.inverted_changes],
    }

    {:reply, {:ok, state}, state}
  end

  # Fetch the current contents of the document
  @impl true
  def handle_call(:get_contents, _from, state) do
    {:reply, state.contents, state}
  end

  # Revert the applied changes one by one to see how the
  # document transformed over time
  @impl true
  def handle_call(:get_history, _from, state) do
    current = {state.version, state.contents}

    history =
      Enum.scan(state.inverted_changes, current, fn inverted, {version, contents} ->
        contents = Delta.compose(contents, inverted)
        {version - 1, contents}
      end)

    {:reply, [current | history], state}
  end

  # Don't undo when document is already empty
  @impl true
  def handle_call(:undo, _from, %{version: 0} = state) do
    {:reply, state.contents, state}
  end

  # Revert the last change, removing it from our stack and
  # updating the contents
  @impl true
  def handle_call(:undo, _from, state) do
    [last_change | changes] = state.inverted_changes

    state = %{
      version: state.version - 1,
      contents: Delta.compose(state.contents, last_change),
      inverted_changes: changes,
    }

    {:reply, state.contents, state}
  end
end