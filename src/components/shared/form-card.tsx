import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type FormCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormCard({ title, description, children, footer }: FormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">{children}</CardContent>
      {footer && (
        <>
          <Separator />
          <CardFooter className="justify-end gap-3 pt-4">{footer}</CardFooter>
        </>
      )}
    </Card>
  );
}
