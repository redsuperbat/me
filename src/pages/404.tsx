import { Anchor } from "@/components/Anchor";

export default function forOhFour() {
  return (
    <div className="w-screen h-screen grid place-items-center dark:bg-slate-900">
      <div className="flex flex-col text-center">
        <h1 className="text-6xl dark:text-white">404 - 😱</h1>
        <h2 className="text-3xl font-bold dark:text-white">
          Looks like you are lost
        </h2>
        <div>
          <Anchor href="/">Take me back!</Anchor>
        </div>
      </div>
    </div>
  );
}
