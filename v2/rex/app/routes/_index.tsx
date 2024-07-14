import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useNavigation,
  useActionData
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import { getAllPrompts, updatePrompt } from "~/data";
import { openFile } from "~/files";
import openAi from "openai";
import { opensearchClient } from "~/elasticsearch";



export const meta: MetaFunction = () => {
  return [
    { title: "Rex" },
    { name: "description", content: "Rex augmented retrival system" },
  ];
};

export async function loader() {
  const prompts = await getAllPrompts();
  return json({ prompts });
}

export default function Index() {
  const { prompts } = useLoaderData();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "list";
  let $form = useRef<HTMLFormElement>(null)
  
  let navigation = useNavigation()
  let actionData = useActionData<typeof action>()

  useEffect(function resetFormOnSuccess() {
    if (navigation.state === "idle" && actionData?.ok) {
      $form.current?.reset()
    }
  }, [navigation.state, actionData])

  console.log(prompts);
  
  return (
    <div className="font-sans p-4">
       <Form method="post" ref={$form}>
        <label>
          What can I help you with?
          <input type="text" name="query" />
        </label>
        <button type="submit">Query</button>
      </Form>
      {prompts.map((prompt) => (
        <div key={prompt.id}>
          <h2>{prompt.query}</h2>
        </div>
      ))}
    </div>
  );
}

export async function action({
  request,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  await updatePrompt(
    Math.random().toString(36).substring(7) as string,
    formData.get("query") as string
  );
  try {
    await opensearchClient()
  } catch (error) {
    console.error("Error executing search query:", error);
  }
  return json({ ok: true });
}

function makeEsQuery(query: string) {
  
}