import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>

        {description ? (
          <CardDescription>
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}
