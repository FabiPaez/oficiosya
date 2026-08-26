export function clientTest(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Acceso autorizado como CLIENT',
      user: {
        id: req.user.id,
        roles: req.user.roles,
      },
    });
  }
  
  export function providerTest(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Acceso autorizado como PROVIDER',
      user: {
        id: req.user.id,
        roles: req.user.roles,
      },
    });
  }
  
  export function adminTest(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Acceso autorizado como ADMIN',
      user: {
        id: req.user.id,
        roles: req.user.roles,
      },
    });
  }