import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface FlowledEmailProps {
  userName?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "https://flowwled.com";

export function FlowledEmailTemplate({
  userName = "Valued User",
}: FlowledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Flowled!</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif", margin: "auto", padding: "0 8px" }}>
        <Container style={{ border: "1px solid #eaeaea", borderRadius: "12px", margin: "40px auto", padding: "30px", maxWidth: "500px", backgroundColor: "#ffffff" }}>
          <Section style={{ marginTop: "8px", marginBottom: "24px", textAlign: "center" as const }}>
            <Img
              src={`${baseUrl}/brand/logo-full.png`}
              width="140"
              alt="Flowled"
              style={{ margin: "0 auto" }}
            />
          </Section>

          <Heading style={{ color: "#000000", fontSize: "24px", fontWeight: "600", textAlign: "center" as const, padding: "0", margin: "20px 0", letterSpacing: "-0.5px" }}>
            Welcome to Flowled
          </Heading>

          <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "24px", marginBottom: "20px" }}>
            Hello {userName},
          </Text>

          <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "24px" }}>
            We&apos;re thrilled to have you on board. Flowled is your dedicated ledger and financial tracking application, designed to give you complete clarity over your expenses and money movement.
          </Text>

          <Section style={{ textAlign: "center" as const, marginTop: "32px", marginBottom: "32px" }}>
            <Button
              style={{ backgroundColor: "#000000", borderRadius: "8px", color: "#ffffff", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, padding: "12px 24px" }}
              href={`${baseUrl}/dashboard`}
            >
              Go to Dashboard
            </Button>
          </Section>

          <Text style={{ color: "#374151", fontSize: "15px", lineHeight: "24px" }}>
            Get started by adding your first expense or checking out your monthly summary. We&apos;re here to help you stay on top of your finances.
          </Text>

          <Hr style={{ border: "1px solid #eaeaea", margin: "26px 0", width: "100%" }} />

          <Text style={{ color: "#666666", fontSize: "12px", lineHeight: "24px", textAlign: "center" as const, marginBottom: "0" }}>
            Lakhu Teleservices &bull; Flowled App
          </Text>
          <Text style={{ color: "#666666", fontSize: "12px", lineHeight: "24px", textAlign: "center" as const, marginTop: "4px" }}>
            If you have any questions, feel free to reply to this email or contact support.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default FlowledEmailTemplate;
