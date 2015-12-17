
macro to_str {
  case { _ ($toks ...) } => {
    return [makeValue(#{ $toks ... }.map(unwrapSyntax).join(''), #{ here })];
  }
}


macro action {
    rule {
        $name($x (,) ...);
    } => {
        function $name ($x (,) ...) {
          return {
            type: to_str($name),
            $($x: $x) (,) ...
          };
        }
    }
}

export action;
