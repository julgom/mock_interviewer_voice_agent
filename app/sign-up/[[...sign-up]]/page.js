import { SignUp } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex justify-center p-5">
            <SignUp />
        </div>
    )
}