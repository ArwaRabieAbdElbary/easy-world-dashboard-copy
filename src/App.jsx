import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "../router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

function App() {
  const queryClient = new QueryClient();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
         <Toaster position="top-right" />
      </QueryClientProvider>
    </>
  );
}

export default App;
