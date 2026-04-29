import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface FlowledEmailProps {
  userName?: string;
  userEmail?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "https://flowwled.com";

export const FlowledEmailTemplate = ({
  userName = "Valued User",
}: FlowledEmailProps) => {
  const previewText = `Welcome to Flowled!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#121212",
                subtle: "#F5F5F5",
              },
            },
          },
        }}
      >
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded-xl my-[40px] mx-auto p-[30px] max-w-[500px] bg-white shadow-sm">
            <Section className="mt-[8px] mb-[24px]">
              <Img
                src={`${baseUrl}/brand/logo-full.png`}
                width="140"
                alt="Flowled"
                className="my-0 mx-auto"
              />
            </Section>

            <Heading className="text-black text-[24px] font-semibold text-center p-0 my-[20px] mx-0 tracking-tight">
              Welcome to Flowled
            </Heading>

            <Text className="text-gray-700 text-[15px] leading-[24px] mb-[20px]">
              Hello {userName},
            </Text>

            <Text className="text-gray-700 text-[15px] leading-[24px]">
              We're thrilled to have you on board. Flowled is your dedicated ledger and financial tracking application, designed to give you complete clarity over your expenses and money movement.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-black rounded-lg text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={`${baseUrl}/dashboard`}
              >
                Go to Dashboard
              </Button>
            </Section>

            <Text className="text-gray-700 text-[15px] leading-[24px]">
              Get started by adding your first expense or checking out your monthly summary. We're here to help you stay on top of your finances.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mb-0">
              Lakhu Teleservices • Flowled App
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center mt-1">
              If you have any questions, feel free to reply to this email or contact support.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default FlowledEmailTemplate;
