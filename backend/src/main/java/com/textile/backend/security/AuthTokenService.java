package com.textile.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class AuthTokenService {

    private static final String HMAC_ALGORITHM =
            "HmacSHA256";

    private final byte[] secret;

    private final long expirationMillis;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public AuthTokenService(
            @Value("${app.auth.secret}") String secret,
            @Value("${app.auth.expiration-ms:28800000}")
            long expirationMillis
    ) {

        if (
                secret == null ||
                        secret.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "app.auth.secret must be configured"
            );
        }

        this.secret =
                secret.getBytes(
                        StandardCharsets.UTF_8
                );

        this.expirationMillis =
                expirationMillis;
    }


    // ============================================================
    // INTERNAL USER TOKEN
    // ============================================================
    //
    // Token format:
    //
    // U:<userId>.<expiresAt>.<signature>
    //
    // Example:
    //
    // U:5.1791111111111
    //
    // The actual token contains:
    //
    // encodedPayload.signature
    //
    // ============================================================

    public String createToken(
            Long userId
    ) {

        return createToken(
                "U",
                userId
        );
    }


    // ============================================================
    // CUSTOMER TOKEN
    // ============================================================
    //
    // Token format:
    //
    // C:<customerId>.<expiresAt>.<signature>
    //
    // Customer authentication is intentionally separated
    // from internal employee/user authentication.
    //
    // ============================================================

    public String createCustomerToken(
            Long customerId
    ) {

        return createToken(
                "C",
                customerId
        );
    }


    // ============================================================
    // COMMON TOKEN CREATION
    // ============================================================

    private String createToken(
            String type,
            Long id
    ) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Authentication ID cannot be null"
            );
        }


        if (
                type == null ||
                        (
                                !type.equals("U") &&
                                        !type.equals("C")
                        )
        ) {

            throw new IllegalArgumentException(
                    "Invalid authentication token type"
            );
        }


        /*
         * Token expiration time.
         *
         * Default:
         * 8 hours
         *
         * This value can be changed using:
         *
         * app.auth.expiration-ms
         */
        long expiresAt =
                System.currentTimeMillis()
                        + expirationMillis;


        /*
         * Payload:
         *
         * U:5.1791111111111
         *
         * OR
         *
         * C:12.1791111111111
         */
        String payload =
                type
                        + ":"
                        + id
                        + "."
                        + expiresAt;


        /*
         * Encode the payload using URL-safe Base64.
         */
        String encodedPayload =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(
                                payload.getBytes(
                                        StandardCharsets.UTF_8
                                )
                        );


        /*
         * Sign the encoded payload using HMAC-SHA256.
         */
        String signature =
                sign(
                        encodedPayload
                );


        /*
         * Final token:
         *
         * encodedPayload.signature
         */
        return encodedPayload
                + "."
                + signature;
    }


    // ============================================================
    // GET INTERNAL USER ID
    // ============================================================
    //
    // Only tokens with:
    //
    // U:<userId>
    //
    // are accepted.
    //
    // ============================================================

    public Long getUserId(
            String token
    ) {

        return getId(
                token,
                "U"
        );
    }


    // ============================================================
    // GET CUSTOMER ID
    // ============================================================
    //
    // Only tokens with:
    //
    // C:<customerId>
    //
    // are accepted.
    //
    // ============================================================

    public Long getCustomerId(
            String token
    ) {

        return getId(
                token,
                "C"
        );
    }


    // ============================================================
    // VALIDATE TOKEN AND GET ID
    // ============================================================

    private Long getId(
            String token,
            String expectedType
    ) {

        try {

            /*
             * Empty token.
             */
            if (
                    token == null ||
                            token.isBlank()
            ) {

                return null;
            }


            /*
             * Expected token structure:
             *
             * encodedPayload.signature
             */
            String[] parts =
                    token.split(
                            "\\.",
                            -1
                    );


            if (parts.length != 2) {

                return null;
            }


            String encodedPayload =
                    parts[0];

            String actualSignature =
                    parts[1];


            /*
             * Recalculate the expected signature.
             */
            String expectedSignature =
                    sign(
                            encodedPayload
                    );


            /*
             * Convert signatures to byte arrays
             * for constant-time comparison.
             */
            byte[] expected =
                    expectedSignature.getBytes(
                            StandardCharsets.UTF_8
                    );

            byte[] actual =
                    actualSignature.getBytes(
                            StandardCharsets.UTF_8
                    );


            /*
             * Protect against timing/signature
             * comparison attacks.
             */
            if (
                    !MessageDigest.isEqual(
                            expected,
                            actual
                    )
            ) {

                return null;
            }


            /*
             * Decode payload.
             */
            String payload =
                    new String(
                            Base64.getUrlDecoder()
                                    .decode(
                                            encodedPayload
                                    ),
                            StandardCharsets.UTF_8
                    );


            /*
             * Payload:
             *
             * U:5.1791111111111
             *
             * OR
             *
             * C:12.1791111111111
             */
            String[] payloadParts =
                    payload.split(
                            "\\.",
                            -1
                    );


            if (
                    payloadParts.length != 2
            ) {

                return null;
            }


            /*
             * Extract:
             *
             * U:5
             *
             * OR
             *
             * C:12
             */
            String subject =
                    payloadParts[0];


            /*
             * Extract expiration timestamp.
             */
            long expiresAt =
                    Long.parseLong(
                            payloadParts[1]
                    );


            /*
             * Subject:
             *
             * U:5
             *
             * OR
             *
             * C:12
             */
            String[] subjectParts =
                    subject.split(
                            ":",
                            -1
                    );


            if (
                    subjectParts.length != 2
            ) {

                return null;
            }


            /*
             * Make sure the token belongs to
             * the authentication type requested.
             *
             * U = internal employee/user
             *
             * C = customer
             */
            if (
                    !expectedType.equals(
                            subjectParts[0]
                    )
            ) {

                return null;
            }


            /*
             * Convert the ID to Long.
             */
            long id =
                    Long.parseLong(
                            subjectParts[1]
                    );


            /*
             * Check expiration.
             */
            if (
                    expiresAt <=
                            System.currentTimeMillis()
            ) {

                return null;
            }


            /*
             * Everything is valid.
             */
            return id;

        } catch (Exception ignored) {

            /*
             * Any malformed, expired or invalid
             * token is treated as unauthenticated.
             */
            return null;
        }
    }


    // ============================================================
    // SIGN TOKEN USING HMAC-SHA256
    // ============================================================

    private String sign(
            String value
    ) {

        try {

            Mac mac =
                    Mac.getInstance(
                            HMAC_ALGORITHM
                    );


            mac.init(
                    new SecretKeySpec(
                            secret,
                            HMAC_ALGORITHM
                    )
            );


            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            mac.doFinal(
                                    value.getBytes(
                                            StandardCharsets.UTF_8
                                    )
                            )
                    );

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "Unable to sign authentication token",
                    ex
            );
        }
    }
}