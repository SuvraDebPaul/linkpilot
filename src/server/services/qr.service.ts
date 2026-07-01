import QRCode from "qrcode";

export type QrOptions = {
  fg?: string;
  bg?: string;
  ecLevel?: string;
  margin?: number;
};

export async function generateQrCodeDataUrl(value: string, opts: QrOptions = {}) {
  return QRCode.toDataURL(value, {
    margin: opts.margin ?? 2,
    width: 320,
    errorCorrectionLevel: (opts.ecLevel as QRCode.QRCodeErrorCorrectionLevel) ?? "M",
    color: {
      dark: opts.fg ?? "#000000",
      light: opts.bg ?? "#ffffff",
    },
  });
}
