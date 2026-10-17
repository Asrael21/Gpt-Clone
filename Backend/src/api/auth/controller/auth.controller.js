import {
  registerService,
  loginService,
  getCurrentUserService,
} from "../service/auth.service.js";

export async function registerController(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const result = await registerService({ username, email, password });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginController(req, res, next) {
  try {
    const { identifier, password } = req.body;
    const result = await loginService({ identifier, password });

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function meController(req, res, next) {
  try {
    const user = await getCurrentUserService(req.user.id);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
