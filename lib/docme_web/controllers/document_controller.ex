defmodule DocmeWeb.DocumentController do
  use DocmeWeb, :controller

  def show(conn, %{"id" => id}) do
    render(conn, "show.html", id: id)
  end
end
